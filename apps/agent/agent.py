"""
TRAVoices LiveKit Agent v4 - Multi-Participant Translation
Uses LiveKit Agents v1.x with AgentSession per listener.

Architecture:
- One AgentSession per listener (person who needs translations)
- Each session: STT (Deepgram) -> LLM (translation) -> TTS (PlayHT)
- Active speaker switching to handle multi-participant input
- Conversation context for pronoun resolution
"""

import asyncio
import logging
import os
import json
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from dotenv import load_dotenv

from livekit import rtc
from livekit.agents import (
    Agent,
    AgentSession,
    RunContext,
    RoomInputOptions,
    RoomOutputOptions,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
)
from livekit.plugins import deepgram, silero, cartesia, openai

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s %(name)s - %(message)s"
)
logger = logging.getLogger("travoices")
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

# =============================================================================
# CONFIGURATION
# =============================================================================

LANG_NAMES = {"en": "English", "ar": "Arabic"}

# Cartesia voices - Sonic model
# See: https://play.cartesia.ai/voices
CARTESIA_VOICES = {
    "en": "79a125e8-cd45-4c13-8a67-188112f4dd22",  # British Lady
    "ar": "79a125e8-cd45-4c13-8a67-188112f4dd22",  # Using same for now (Cartesia has limited Arabic)
}

# =============================================================================
# DATA STRUCTURES
# =============================================================================

@dataclass
class ParticipantInfo:
    """Language preferences for a participant."""
    identity: str
    display_name: str
    speaks_language: str
    hears_language: str


@dataclass
class ConversationContext:
    """Maintains conversation history for pronoun resolution."""
    history: List[dict] = field(default_factory=list)
    max_exchanges: int = 5

    def add(self, speaker: str, text: str, lang: str):
        self.history.append({
            "speaker": speaker,
            "text": text,
            "lang": lang,
            "timestamp": time.time()
        })
        if len(self.history) > self.max_exchanges:
            self.history.pop(0)

    def get_context(self) -> str:
        if not self.history:
            return "No prior context."
        return "\n".join([
            f"{h['speaker']} ({LANG_NAMES.get(h['lang'], h['lang'])}): {h['text']}"
            for h in self.history[-3:]
        ])

    def clear(self):
        self.history.clear()


# =============================================================================
# TRANSLATION AGENT
# =============================================================================

class TranslationAgent(Agent):
    """
    Agent that translates speech instead of chatting.
    Uses LLM to translate transcribed speech to target language.
    """

    def __init__(
        self,
        target_language: str,
        target_identity: str,
        conversation_context: ConversationContext,
        participants: Dict[str, ParticipantInfo],
    ):
        self.target_language = target_language
        self.target_identity = target_identity
        self.conversation_context = conversation_context
        self.participants = participants
        self.current_speaker_identity: Optional[str] = None

        super().__init__(
            instructions=self._build_instructions(),
        )

    def _build_instructions(self) -> str:
        """Build translation-focused system instructions."""
        target_lang_name = LANG_NAMES.get(self.target_language, self.target_language)
        context = self.conversation_context.get_context()

        return f"""You are a professional real-time voice translator.

TARGET LANGUAGE: {target_lang_name}

CONVERSATION CONTEXT:
{context}

CRITICAL RULES:
1. Output ONLY the translation - no explanations, quotes, labels, or formatting
2. Resolve pronouns ("that", "it", "this", "he", "she") using conversation context
3. Preserve tone, emotion, and speaking style
4. Keep it natural for spoken delivery (not written text)
5. Handle names and proper nouns appropriately
6. If the input is already in the target language, output it unchanged
7. Never add phrases like "Translation:" or "In {target_lang_name}:" - just the translated text"""

    async def on_enter(self):
        """Called when agent session starts."""
        logger.info(f"TranslationAgent started for {self.target_identity} (target: {self.target_language})")

    async def on_user_turn_completed(
        self,
        turn_ctx: RunContext,
        new_message: llm.ChatMessage,
    ) -> None:
        """
        Called when STT completes a user turn.
        We translate the speech instead of having a conversation.
        """
        # Extract the transcribed text
        user_text = ""
        if hasattr(new_message, 'text_content'):
            user_text = new_message.text_content or ""
        elif hasattr(new_message, 'content'):
            user_text = str(new_message.content) if new_message.content else ""

        user_text = user_text.strip()

        if not user_text or len(user_text) < 2:
            logger.debug("Skipping empty or too short transcript")
            return

        # Determine source language from speaker metadata
        speaker_info = None
        source_lang = "en"  # Default

        if self.current_speaker_identity:
            speaker_info = self.participants.get(self.current_speaker_identity)
            if speaker_info:
                source_lang = speaker_info.speaks_language
                # Add to conversation context
                self.conversation_context.add(
                    speaker_info.display_name,
                    user_text,
                    source_lang
                )

        speaker_name = speaker_info.display_name if speaker_info else "Unknown"

        # Skip if already in target language
        if source_lang == self.target_language:
            logger.debug(f"No translation needed: {source_lang} == {self.target_language}")
            return

        logger.info(f"Translating for {self.target_identity}: '{user_text[:50]}...' ({source_lang} -> {self.target_language})")

        # Update instructions with fresh context
        self._instructions = self._build_instructions()

        # Send translation metadata via data channel
        await self._send_translation_metadata(
            speaker_name=speaker_name,
            original_text=user_text,
            source_lang=source_lang,
        )

        # Generate translation via LLM -> TTS
        # The LLM will use our translation instructions
        target_lang_name = LANG_NAMES.get(self.target_language, self.target_language)
        await turn_ctx.generate_reply(
            instructions=f"Translate this to {target_lang_name}. Output ONLY the translation: {user_text}"
        )

    async def _send_translation_metadata(
        self,
        speaker_name: str,
        original_text: str,
        source_lang: str,
    ):
        """Send translation text metadata via data channel."""
        if not self.session or not self.session.room:
            return

        metadata = {
            "type": "translation_text",
            "speakerName": speaker_name,
            "originalText": original_text,
            "translatedText": "",  # TTS output handles the audio
            "sourceLang": source_lang,
            "targetLang": self.target_language,
            "timestamp": time.time(),
        }

        try:
            await self.session.room.local_participant.publish_data(
                payload=json.dumps(metadata).encode('utf-8'),
                reliable=True,
                destination_identities=[self.target_identity]
            )
            logger.debug(f"Sent metadata to {self.target_identity}")
        except Exception as e:
            logger.error(f"Failed to send metadata: {e}")

    def set_current_speaker(self, identity: str):
        """Update the current speaker identity for context."""
        self.current_speaker_identity = identity


# =============================================================================
# MULTI-PARTICIPANT TRANSLATOR
# =============================================================================

class MultiParticipantTranslator:
    """
    Manages one AgentSession per listener for multi-participant translation.
    Each listener gets translations from all other speakers in their preferred language.
    """

    def __init__(self, ctx: JobContext):
        self.ctx = ctx
        self.sessions: Dict[str, AgentSession] = {}
        self.agents: Dict[str, TranslationAgent] = {}
        self.participants: Dict[str, ParticipantInfo] = {}
        self.conversation_context = ConversationContext()
        self.vad = ctx.proc.userdata.get("vad")
        self._active_speaker: Optional[str] = None

    async def start(self):
        """Initialize and handle participant events."""
        logger.info("MultiParticipantTranslator starting...")

        # Register event handlers
        self.ctx.room.on("participant_connected", self._on_participant_connected)
        self.ctx.room.on("participant_disconnected", self._on_participant_disconnected)
        self.ctx.room.on("active_speakers_changed", self._on_active_speakers_changed)
        self.ctx.room.on("track_subscribed", self._on_track_subscribed)

        # Process existing participants
        for participant in self.ctx.room.remote_participants.values():
            if not self._is_agent(participant.identity):
                await self._add_participant(participant)

        logger.info(f"Started with {len(self.participants)} participants")

    def _is_agent(self, identity: str) -> bool:
        """Check if a participant is an agent."""
        return identity.startswith("agent-") or "agent" in identity.lower()

    def _parse_metadata(self, participant: rtc.RemoteParticipant) -> Optional[ParticipantInfo]:
        """Parse language preferences from participant metadata."""
        if not participant.metadata:
            logger.warning(f"No metadata for {participant.identity}")
            return None

        try:
            meta = json.loads(participant.metadata)
            return ParticipantInfo(
                identity=participant.identity,
                display_name=meta.get("displayName", participant.name or participant.identity),
                speaks_language=meta.get("speaksLanguage", "en"),
                hears_language=meta.get("hearsLanguage", "ar"),
            )
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse metadata for {participant.identity}: {e}")
            return None

    async def _add_participant(self, participant: rtc.RemoteParticipant):
        """Add a new listener with their own translation session."""
        if self._is_agent(participant.identity):
            return

        if participant.identity in self.participants:
            return  # Already added

        info = self._parse_metadata(participant)
        if not info:
            return

        self.participants[participant.identity] = info
        logger.info(f"Added participant: {info.display_name} (speaks={info.speaks_language}, hears={info.hears_language})")

        # Create AgentSession for this listener
        await self._create_session_for_listener(info)

    async def _create_session_for_listener(self, listener: ParticipantInfo):
        """Create a translation session that outputs to this specific listener."""
        logger.info(f"Creating session for {listener.display_name} (hears: {listener.hears_language})")

        # Get voice for target language
        voice = os.getenv(f"CARTESIA_VOICE_{listener.hears_language.upper()}")
        if not voice:
            voice = CARTESIA_VOICES.get(listener.hears_language, CARTESIA_VOICES["en"])

        # Create TTS - Cartesia Sonic is extremely fast (~50ms latency)
        tts = cartesia.TTS(
            voice=voice,
            model="sonic-2",
            language=listener.hears_language,
        )

        # Create LLM for translation (via OpenRouter)
        translation_llm = openai.LLM(
            model="google/gemini-2.0-flash-001",
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
            temperature=0.3,
        )

        # Create translation agent
        agent = TranslationAgent(
            target_language=listener.hears_language,
            target_identity=listener.identity,
            conversation_context=self.conversation_context,
            participants=self.participants,
        )

        # Create session
        session = AgentSession(
            stt=deepgram.STT(model="nova-2"),
            llm=translation_llm,
            tts=tts,
            vad=self.vad,
            allow_interruptions=False,  # Don't interrupt translations
        )

        # Start the session
        # Note: We'll handle audio input switching via active speaker detection
        await session.start(
            agent=agent,
            room=self.ctx.room,
            room_input=RoomInputOptions(
                enabled=True,
                # Will switch participant based on active speaker
            ),
            room_output=RoomOutputOptions(
                enabled=True,
                transcription_enabled=False,
                # Track will be named with participant identity
            ),
        )

        self.sessions[listener.identity] = session
        self.agents[listener.identity] = agent
        logger.info(f"Session created for {listener.display_name}")

    def _on_participant_connected(self, participant: rtc.RemoteParticipant):
        """Handle new participant connection."""
        if self._is_agent(participant.identity):
            logger.debug(f"Ignoring agent: {participant.identity}")
            return

        logger.info(f"Participant connected: {participant.identity}")
        asyncio.create_task(self._add_participant(participant))

    def _on_participant_disconnected(self, participant: rtc.RemoteParticipant):
        """Handle participant disconnection."""
        logger.info(f"Participant disconnected: {participant.identity}")

        # Clean up session
        if participant.identity in self.sessions:
            session = self.sessions.pop(participant.identity)
            asyncio.create_task(session.aclose())

        if participant.identity in self.agents:
            del self.agents[participant.identity]

        if participant.identity in self.participants:
            del self.participants[participant.identity]

    def _on_active_speakers_changed(self, speakers: List[rtc.Participant]):
        """
        Switch translation input to the currently active speaker.
        This is key for multi-participant translation.
        """
        for speaker in speakers:
            # Skip agents
            if self._is_agent(speaker.identity):
                continue

            # Found an active human speaker
            if speaker.identity != self._active_speaker:
                self._active_speaker = speaker.identity
                logger.info(f"Active speaker changed to: {speaker.identity}")

                # Update all translation agents with current speaker
                for identity, agent in self.agents.items():
                    # Don't translate for the speaker themselves
                    if identity != speaker.identity:
                        agent.set_current_speaker(speaker.identity)

            return

    def _on_track_subscribed(
        self,
        track: rtc.Track,
        publication: rtc.TrackPublication,
        participant: rtc.RemoteParticipant
    ):
        """Handle new track subscription."""
        if track.kind != rtc.TrackKind.KIND_AUDIO:
            return

        if self._is_agent(participant.identity):
            logger.debug(f"Ignoring audio from agent: {participant.identity}")
            return

        logger.info(f"Subscribed to audio from {participant.identity}")

        # Ensure participant is tracked
        if participant.identity not in self.participants:
            asyncio.create_task(self._add_participant(participant))

    async def stop(self):
        """Clean up all sessions."""
        logger.info("Stopping MultiParticipantTranslator...")
        for identity, session in self.sessions.items():
            try:
                await session.aclose()
            except Exception as e:
                logger.error(f"Error closing session for {identity}: {e}")
        self.sessions.clear()
        self.agents.clear()


# =============================================================================
# AGENT ENTRYPOINT
# =============================================================================

def prewarm(proc: JobProcess):
    """Prewarm VAD model for faster startup."""
    logger.info("Loading VAD model...")
    proc.userdata["vad"] = silero.VAD.load()
    logger.info("VAD model ready")


async def entrypoint(ctx: JobContext):
    """Main entrypoint for agent job."""
    logger.info(f"Agent joining room: {ctx.room.name}")

    # Connect to room
    await ctx.connect()

    # Wait for first human participant
    while True:
        participant = await ctx.wait_for_participant()
        if not (participant.identity.startswith("agent-") or "agent" in participant.identity.lower()):
            break
        logger.info(f"Skipping agent participant: {participant.identity}")

    logger.info(f"First human participant: {participant.identity}")

    # Create and start multi-participant translator
    translator = MultiParticipantTranslator(ctx)
    await translator.start()

    # Keep alive while connected
    try:
        while ctx.room.connection_state == rtc.ConnectionState.CONN_CONNECTED:
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        logger.info("Agent cancelled, shutting down...")
    finally:
        await translator.stop()

    logger.info("Agent exiting")


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
            agent_name="travoices-translator",
        ),
    )

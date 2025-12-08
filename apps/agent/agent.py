"""
TRAVoices LiveKit Agent - Production Version v2
Real-time voice translation with:
- Per-participant language preferences
- Context-aware translation
- Targeted audio routing
- Adaptive silence detection for natural conversation
"""

import asyncio
import logging
import os
import base64
import json
import struct
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from dotenv import load_dotenv

from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
)
from livekit.plugins import silero

import httpx

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("travoices")

# =============================================================================
# CONFIGURATION - Optimized for natural conversation
# =============================================================================

CONFIG = {
    # Speech Detection - tuned for natural pauses
    "SPEECH_THRESHOLD": 120,           # Lowered for softer speakers
    "SILENCE_FRAMES_END": 90,          # ~1.8s default silence (was 60/1.2s)
    "SILENCE_FRAMES_EXTENSION": 45,    # +0.9s for long utterances
    "MIN_AUDIO_BYTES": 16000,          # ~0.5s (catch short "yes", "ok")
    "MAX_AUDIO_BYTES": 1440000,        # ~15s for long explanations
    "LONG_UTTERANCE_THRESHOLD": 240000, # 5s triggers extended wait

    # Models
    "DEEPGRAM_MODEL": "nova-2",
    "OPENROUTER_MODEL": os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini"),
    "ELEVENLABS_MODEL": "eleven_multilingual_v2",

    # Voices
    "VOICE_EN": "21m00Tcm4TlvDq8ikWAM",  # Rachel
    "VOICE_AR": "TX3LPaxmHKxFdv7VOQHJ",  # Yosef
}

LANG_NAMES = {
    "en": "English",
    "ar": "Arabic",
}


# =============================================================================
# PARTICIPANT TRACKING
# =============================================================================

@dataclass
class ParticipantInfo:
    """Tracks language preferences for each participant."""
    identity: str
    display_name: str
    speaks_language: str  # What language they speak
    hears_language: str   # What language they want to hear


@dataclass
class ConversationContext:
    """Maintains conversation history for context-aware translation."""
    history: List[dict] = field(default_factory=list)
    max_exchanges: int = 5

    def add(self, speaker_name: str, text: str, lang: str):
        self.history.append({
            "speaker": speaker_name,
            "text": text,
            "lang": lang,
            "timestamp": time.time()
        })
        # Keep only recent exchanges
        if len(self.history) > self.max_exchanges:
            self.history.pop(0)

    def get_context_for_prompt(self) -> str:
        if not self.history:
            return "No prior context."
        return "\n".join([
            f"{h['speaker']} ({LANG_NAMES.get(h['lang'], h['lang'])}): {h['text']}"
            for h in self.history[-3:]
        ])

    def clear(self):
        self.history.clear()


# Global state per room
participants: Dict[str, ParticipantInfo] = {}
conversation_context = ConversationContext()


# =============================================================================
# AUDIO PROCESSING HELPERS
# =============================================================================

def convert_to_mono_16bit(audio_data: bytes, num_channels: int) -> bytes:
    """Convert audio to mono 16-bit PCM."""
    if num_channels == 1:
        return audio_data

    # Stereo to mono conversion
    samples = []
    for i in range(0, len(audio_data), 4):  # 4 bytes per stereo sample
        if i + 4 <= len(audio_data):
            left = struct.unpack('<h', audio_data[i:i+2])[0]
            right = struct.unpack('<h', audio_data[i+2:i+4])[0]
            mono = (left + right) // 2
            samples.append(struct.pack('<h', mono))

    return b''.join(samples)


def calculate_rms(audio_data: bytes) -> float:
    """Calculate RMS of audio data."""
    if len(audio_data) < 2:
        return 0

    try:
        num_samples = len(audio_data) // 2
        samples = struct.unpack(f'<{num_samples}h', audio_data[:num_samples * 2])
        if not samples:
            return 0
        rms = (sum(s * s for s in samples) / len(samples)) ** 0.5
        return rms
    except Exception:
        return 0


# =============================================================================
# TRANSLATION PROMPT BUILDER
# =============================================================================

def build_translation_prompt(context: str, source_lang: str, target_lang: str) -> str:
    """Build context-aware translation prompt."""
    return f"""You are a professional real-time voice translator for a live conversation.

RECENT CONVERSATION CONTEXT:
{context}

TASK: Translate the new message from {LANG_NAMES.get(source_lang, source_lang)} to {LANG_NAMES.get(target_lang, target_lang)}.

CRITICAL RULES:
1. Output ONLY the translation - no explanations, quotes, or formatting
2. Resolve pronouns ("that", "it", "this", "he", "she") using conversation context
3. Preserve tone, emotion, and speaking style
4. Keep it natural for spoken delivery (not written text)
5. Handle names and proper nouns appropriately
6. If context helps clarify meaning, use it for better translation"""


# =============================================================================
# API FUNCTIONS
# =============================================================================

async def transcribe_audio(audio_data: bytes, sample_rate: int) -> tuple[str, str]:
    """Transcribe audio using Deepgram. Returns (transcript, language)."""
    api_key = os.getenv("DEEPGRAM_API_KEY")

    if not api_key:
        logger.error("DEEPGRAM_API_KEY not set")
        return "", "en"

    logger.info(f"Sending {len(audio_data)} bytes to Deepgram at {sample_rate}Hz")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.deepgram.com/v1/listen",
                params={
                    "model": CONFIG["DEEPGRAM_MODEL"],
                    "detect_language": "true",
                    "punctuate": "true",
                    "encoding": "linear16",
                    "sample_rate": str(sample_rate),
                    "channels": "1",
                },
                headers={
                    "Authorization": f"Token {api_key}",
                    "Content-Type": "audio/raw",
                },
                content=audio_data,
                timeout=30.0,
            )

            if response.status_code != 200:
                logger.error(f"Deepgram error {response.status_code}: {response.text[:500]}")
                return "", "en"

            data = response.json()
            channel = data.get("results", {}).get("channels", [{}])[0]
            alternative = channel.get("alternatives", [{}])[0]
            transcript = alternative.get("transcript", "").strip()
            confidence = alternative.get("confidence", 0)
            detected_lang = channel.get("detected_language", "en")

            logger.info(f"Deepgram response: '{transcript}' (confidence: {confidence}, lang: {detected_lang})")

            # Map language codes
            if detected_lang in ["en", "en-US", "en-GB", "en-AU"]:
                detected_lang = "en"
            elif detected_lang in ["ar", "ar-SA", "ar-EG"]:
                detected_lang = "ar"

            return transcript, detected_lang

    except Exception as e:
        logger.error(f"Deepgram exception: {e}")
        return "", "en"


async def translate_text(text: str, source_lang: str, target_lang: str, context: str = "") -> str:
    """Translate text using OpenRouter with conversation context."""
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        logger.error("OPENROUTER_API_KEY not set")
        return text

    # Build context-aware prompt
    system_prompt = build_translation_prompt(context, source_lang, target_lang)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://travoices.app",
                    "X-Title": "TRAVoices",
                },
                json={
                    "model": CONFIG["OPENROUTER_MODEL"],
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": text},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1000,
                },
                timeout=30.0,
            )

            if response.status_code != 200:
                logger.error(f"OpenRouter error {response.status_code}: {response.text[:200]}")
                return text

            data = response.json()
            translated = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return translated or text

    except Exception as e:
        logger.error(f"OpenRouter exception: {e}")
        return text


async def synthesize_speech(text: str, lang: str) -> bytes:
    """Synthesize speech using ElevenLabs. Returns audio bytes."""
    api_key = os.getenv("ELEVENLABS_API_KEY")

    if not api_key:
        logger.error("ELEVENLABS_API_KEY not set")
        return b""

    voice_id = CONFIG["VOICE_AR"] if lang == "ar" else CONFIG["VOICE_EN"]

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                headers={
                    "xi-api-key": api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "text": text,
                    "model_id": CONFIG["ELEVENLABS_MODEL"],
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                    },
                },
                timeout=60.0,
            )

            if response.status_code != 200:
                logger.error(f"ElevenLabs error {response.status_code}: {response.text[:200]}")
                return b""

            return response.content

    except Exception as e:
        logger.error(f"ElevenLabs exception: {e}")
        return b""


# =============================================================================
# AGENT LOGIC
# =============================================================================

def prewarm(proc: JobProcess):
    """Prewarm VAD model for faster startup."""
    logger.info("Loading VAD model...")
    proc.userdata["vad"] = silero.VAD.load()
    logger.info("VAD model ready")


def parse_participant_metadata(participant: rtc.RemoteParticipant) -> Optional[ParticipantInfo]:
    """Parse language preferences from participant metadata."""
    if not participant.metadata:
        logger.warning(f"No metadata for participant {participant.identity}")
        return None

    try:
        meta = json.loads(participant.metadata)
        info = ParticipantInfo(
            identity=participant.identity,
            display_name=meta.get("displayName", participant.name or participant.identity),
            speaks_language=meta.get("speaksLanguage", "en"),
            hears_language=meta.get("hearsLanguage", "ar"),
        )
        logger.info(f"Parsed participant {info.display_name}: speaks={info.speaks_language}, hears={info.hears_language}")
        return info
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse metadata for {participant.identity}: {e}")
        return None


async def entrypoint(ctx: JobContext):
    """Main agent entrypoint - called when joining a room."""
    logger.info(f"Joining room: {ctx.room.name}")

    # Clear state for new room
    participants.clear()
    conversation_context.clear()

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    remote_participants = list(ctx.room.remote_participants.keys())
    logger.info(f"Connected. Participants: {remote_participants}")

    # Wait for first participant
    participant = await ctx.wait_for_participant()
    logger.info(f"First participant joined: {participant.identity}")

    # Parse their metadata
    info = parse_participant_metadata(participant)
    if info:
        participants[participant.identity] = info

    # Track active audio streams
    active_streams = set()

    async def start_processing(track: rtc.Track, participant_id: str):
        """Start processing audio from a track."""
        if participant_id in active_streams:
            return
        active_streams.add(participant_id)

        audio_stream = rtc.AudioStream(track)
        await process_audio_stream(ctx, audio_stream, participant_id)
        active_streams.discard(participant_id)

    # Handle existing tracks
    for pub in participant.track_publications.values():
        if pub.track and pub.kind == rtc.TrackKind.KIND_AUDIO:
            asyncio.create_task(start_processing(pub.track, participant.identity))

    # Handle new participant connections
    @ctx.room.on("participant_connected")
    def on_participant_connected(new_participant: rtc.RemoteParticipant):
        logger.info(f"Participant connected: {new_participant.identity}")
        info = parse_participant_metadata(new_participant)
        if info:
            participants[new_participant.identity] = info

    # Handle participant disconnections
    @ctx.room.on("participant_disconnected")
    def on_participant_disconnected(old_participant: rtc.RemoteParticipant):
        logger.info(f"Participant disconnected: {old_participant.identity}")
        if old_participant.identity in participants:
            del participants[old_participant.identity]

    # Handle new tracks
    @ctx.room.on("track_subscribed")
    def on_track_subscribed(track: rtc.Track, publication: rtc.TrackPublication, remote_participant: rtc.RemoteParticipant):
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            logger.info(f"New audio track from {remote_participant.identity}")
            # Parse metadata if we haven't already
            if remote_participant.identity not in participants:
                info = parse_participant_metadata(remote_participant)
                if info:
                    participants[remote_participant.identity] = info
            asyncio.create_task(start_processing(track, remote_participant.identity))

    # Keep agent alive
    try:
        while ctx.room.connection_state == rtc.ConnectionState.CONN_CONNECTED:
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        logger.info("Agent shutting down")


async def process_audio_stream(ctx: JobContext, audio_stream: rtc.AudioStream, participant_id: str):
    """Process audio stream with adaptive silence detection for natural speech."""
    logger.info(f"Processing audio from {participant_id}")

    audio_buffer = bytearray()
    is_speaking = False
    silence_count = 0
    frame_count = 0
    sample_rate = 48000
    num_channels = 1

    async for event in audio_stream:
        frame = event.frame
        frame_count += 1

        # Get frame properties
        sample_rate = frame.sample_rate
        num_channels = frame.num_channels

        # Get raw audio data and convert to mono
        raw_data = bytes(frame.data)
        mono_data = convert_to_mono_16bit(raw_data, num_channels)

        # Calculate RMS
        rms = calculate_rms(mono_data)

        # Log first frame info
        if frame_count == 1:
            logger.info(f"Audio format: {sample_rate}Hz, {num_channels} channels, frame size: {len(raw_data)} bytes")

        # Log periodically
        if frame_count % 100 == 0:
            status = "SPEAKING" if is_speaking else "silent"
            logger.debug(f"Frame {frame_count}: RMS={rms:.0f}, buffer={len(audio_buffer)}, {status}")

        # Speech detection
        if rms > CONFIG["SPEECH_THRESHOLD"]:
            if not is_speaking:
                logger.info(f"Speech started (RMS={rms:.0f})")
            is_speaking = True
            silence_count = 0
            audio_buffer.extend(mono_data)

            # Process at max length but keep listening
            if len(audio_buffer) > CONFIG["MAX_AUDIO_BYTES"]:
                logger.info("Max buffer reached, processing segment...")
                audio_copy = bytes(audio_buffer)
                audio_buffer = bytearray()
                asyncio.create_task(process_speech(ctx, audio_copy, participant_id, sample_rate))

        elif is_speaking:
            silence_count += 1
            audio_buffer.extend(mono_data)  # Include trailing silence

            # ADAPTIVE THRESHOLD: longer utterances get more silence tolerance
            silence_threshold = CONFIG["SILENCE_FRAMES_END"]
            if len(audio_buffer) > CONFIG["LONG_UTTERANCE_THRESHOLD"]:
                silence_threshold += CONFIG["SILENCE_FRAMES_EXTENSION"]

            # End of speech detected
            if silence_count >= silence_threshold:
                if len(audio_buffer) >= CONFIG["MIN_AUDIO_BYTES"]:
                    logger.info(f"Speech ended ({len(audio_buffer)//1000}KB, {silence_count} silence frames)")
                    audio_copy = bytes(audio_buffer)
                    asyncio.create_task(process_speech(ctx, audio_copy, participant_id, sample_rate))
                else:
                    logger.debug(f"Audio too short ({len(audio_buffer)} bytes), skipping")

                audio_buffer = bytearray()
                is_speaking = False
                silence_count = 0


async def process_speech(ctx: JobContext, audio_data: bytes, speaker_identity: str, sample_rate: int):
    """Full translation pipeline with per-participant routing."""
    speaker = participants.get(speaker_identity)
    if not speaker:
        logger.warning(f"Unknown speaker: {speaker_identity}, using defaults")
        speaker = ParticipantInfo(
            identity=speaker_identity,
            display_name=speaker_identity,
            speaks_language="en",
            hears_language="ar"
        )

    logger.info(f"=== Translating {len(audio_data)//1000}KB from {speaker.display_name} ===")

    try:
        # Step 1: Speech-to-Text
        transcript, detected_lang = await transcribe_audio(audio_data, sample_rate)
        if not transcript:
            logger.info("No speech detected in transcript")
            return

        # Use detected language or speaker's declared language
        source_lang = detected_lang if detected_lang in ["en", "ar"] else speaker.speaks_language

        logger.info(f"[STT] {speaker.display_name} ({source_lang}): {transcript}")

        # Add to conversation context
        conversation_context.add(speaker.display_name, transcript, source_lang)

        # Step 2 & 3: For each OTHER participant who needs translation
        for pid, listener in participants.items():
            if pid == speaker_identity:
                continue  # Don't send translation to speaker

            # Check if listener needs a translation
            # Translate if: speaker's language != what listener wants to hear
            if source_lang != listener.hears_language:
                logger.info(f"Translating for {listener.display_name}: {source_lang} -> {listener.hears_language}")

                # Get conversation context for better translation
                context = conversation_context.get_context_for_prompt()

                # Translate from speaker's language to listener's target language
                translated = await translate_text(
                    transcript,
                    source_lang,
                    listener.hears_language,
                    context
                )
                logger.info(f"[Translate] ({listener.hears_language}) {translated}")

                # Generate TTS in listener's language
                audio = await synthesize_speech(translated, listener.hears_language)
                if not audio:
                    logger.error("TTS failed")
                    continue

                logger.info(f"[TTS] {len(audio)//1000}KB audio generated for {listener.display_name}")

                # Send ONLY to this listener
                await send_translation_to_participant(
                    ctx,
                    target_identity=pid,
                    original=transcript,
                    translated=translated,
                    source_lang=source_lang,
                    target_lang=listener.hears_language,
                    audio=audio,
                    speaker_name=speaker.display_name
                )

        logger.info("=== Translation complete ===")

    except Exception as e:
        logger.error(f"Translation error: {e}", exc_info=True)


async def send_translation_to_participant(
    ctx: JobContext,
    target_identity: str,
    original: str,
    translated: str,
    source_lang: str,
    target_lang: str,
    audio: bytes,
    speaker_name: str
):
    """Send translation to specific participant only via targeted data channel."""
    audio_base64 = base64.b64encode(audio).decode('utf-8')

    # Chunk audio (LiveKit 64KB limit)
    CHUNK_SIZE = 48000
    chunks = [audio_base64[i:i+CHUNK_SIZE] for i in range(0, len(audio_base64), CHUNK_SIZE)]
    message_id = f"{time.time():.6f}"

    # Send metadata first
    metadata = {
        "type": "translation_start",
        "messageId": message_id,
        "speakerName": speaker_name,
        "originalText": original,
        "translatedText": translated,
        "sourceLang": source_lang,
        "targetLang": target_lang,
        "totalChunks": len(chunks),
    }

    # KEY: destination_identities targets specific participant
    await ctx.room.local_participant.publish_data(
        payload=json.dumps(metadata).encode('utf-8'),
        reliable=True,
        destination_identities=[target_identity]
    )

    # Send audio chunks
    for i, chunk in enumerate(chunks):
        chunk_msg = {
            "type": "translation_chunk",
            "messageId": message_id,
            "chunkIndex": i,
            "totalChunks": len(chunks),
            "audio": chunk,
        }
        await ctx.room.local_participant.publish_data(
            payload=json.dumps(chunk_msg).encode('utf-8'),
            reliable=True,
            destination_identities=[target_identity]
        )
        # Small delay between chunks to prevent overwhelming
        if i < len(chunks) - 1:
            await asyncio.sleep(0.01)

    logger.info(f"Sent translation to {target_identity} ({len(chunks)} chunks)")


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

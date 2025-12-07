"""
TRAVoices LiveKit Agent - Production Version
Real-time voice translation: Deepgram STT + OpenRouter LLM + ElevenLabs TTS
"""

import asyncio
import logging
import os
import base64
import json
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
# CONFIGURATION
# =============================================================================

CONFIG = {
    # Speech detection
    "SPEECH_THRESHOLD": 200,          # RMS threshold to detect speech (lower = more sensitive)
    "SILENCE_FRAMES_END": 75,         # Frames of silence before processing (~1.5s at 50fps)
    "MIN_AUDIO_BYTES": 48000,         # Minimum audio size (~1s at 48kHz)
    "MAX_AUDIO_BYTES": 960000,        # Maximum audio size (~10s at 48kHz)

    # Deepgram
    "DEEPGRAM_MODEL": "nova-2",
    "DEEPGRAM_SAMPLE_RATE": "48000",

    # OpenRouter
    "OPENROUTER_MODEL": os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini"),

    # ElevenLabs
    "ELEVENLABS_MODEL": "eleven_multilingual_v2",
    "VOICE_EN": "21m00Tcm4TlvDq8ikWAM",  # Rachel
    "VOICE_AR": "TX3LPaxmHKxFdv7VOQHJ",  # Yosef
}

TRANSLATION_PROMPT = """You are a professional real-time voice translator.

TASK: Translate the text between Arabic and English.
- If input is English → translate to Arabic
- If input is Arabic → translate to English
- If input is mixed → translate everything to the opposite dominant language

RULES:
1. Output ONLY the translation - no explanations, quotes, or formatting
2. Preserve tone, emotion, and intent
3. Keep it natural and conversational
4. Handle names and proper nouns appropriately
5. If unsure about a word, use the most common translation"""


# =============================================================================
# API FUNCTIONS
# =============================================================================

async def transcribe_audio(audio_data: bytes) -> tuple[str, str]:
    """Transcribe audio using Deepgram. Returns (transcript, language)."""
    api_key = os.getenv("DEEPGRAM_API_KEY")

    if not api_key:
        logger.error("DEEPGRAM_API_KEY not set")
        return "", "en"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.deepgram.com/v1/listen",
                params={
                    "model": CONFIG["DEEPGRAM_MODEL"],
                    "detect_language": "true",
                    "punctuate": "true",
                    "encoding": "linear16",
                    "sample_rate": CONFIG["DEEPGRAM_SAMPLE_RATE"],
                },
                headers={
                    "Authorization": f"Token {api_key}",
                    "Content-Type": "audio/raw",
                },
                content=audio_data,
                timeout=30.0,
            )

            if response.status_code != 200:
                logger.error(f"Deepgram error {response.status_code}: {response.text[:200]}")
                return "", "en"

            data = response.json()
            channel = data.get("results", {}).get("channels", [{}])[0]
            alternative = channel.get("alternatives", [{}])[0]
            transcript = alternative.get("transcript", "").strip()
            detected_lang = channel.get("detected_language", "en")

            # Map language codes
            if detected_lang in ["en", "en-US", "en-GB", "en-AU"]:
                detected_lang = "en"
            elif detected_lang in ["ar", "ar-SA", "ar-EG"]:
                detected_lang = "ar"

            return transcript, detected_lang

    except Exception as e:
        logger.error(f"Deepgram exception: {e}")
        return "", "en"


async def translate_text(text: str, source_lang: str) -> tuple[str, str]:
    """Translate text using OpenRouter. Returns (translated_text, target_lang)."""
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        logger.error("OPENROUTER_API_KEY not set")
        return text, "en"

    # Determine target language
    target_lang = "ar" if source_lang == "en" else "en"

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
                        {"role": "system", "content": TRANSLATION_PROMPT},
                        {"role": "user", "content": text},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1000,
                },
                timeout=30.0,
            )

            if response.status_code != 200:
                logger.error(f"OpenRouter error {response.status_code}: {response.text[:200]}")
                return text, target_lang

            data = response.json()
            translated = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return translated or text, target_lang

    except Exception as e:
        logger.error(f"OpenRouter exception: {e}")
        return text, target_lang


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


async def entrypoint(ctx: JobContext):
    """Main agent entrypoint - called when joining a room."""
    logger.info(f"Joining room: {ctx.room.name}")

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participants = list(ctx.room.remote_participants.keys())
    logger.info(f"Connected. Participants: {participants}")

    # Wait for a participant
    participant = await ctx.wait_for_participant()
    logger.info(f"Translating for: {participant.identity}")

    # Get VAD
    vad = ctx.proc.userdata.get("vad") or silero.VAD.load()

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

    # Handle new tracks
    @ctx.room.on("track_subscribed")
    def on_track_subscribed(track: rtc.Track, publication: rtc.TrackPublication, remote_participant: rtc.RemoteParticipant):
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            logger.info(f"New audio track from {remote_participant.identity}")
            asyncio.create_task(start_processing(track, remote_participant.identity))

    # Keep agent alive
    try:
        while ctx.room.connection_state == rtc.ConnectionState.CONN_CONNECTED:
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        logger.info("Agent shutting down")


async def process_audio_stream(ctx: JobContext, audio_stream: rtc.AudioStream, participant_id: str):
    """Process audio stream, detect speech segments, and translate."""
    logger.info(f"Processing audio from {participant_id}")

    audio_buffer = bytearray()
    is_speaking = False
    silence_count = 0
    frame_count = 0
    processing_lock = asyncio.Lock()

    async for event in audio_stream:
        frame = event.frame
        frame_count += 1
        audio_data = bytes(frame.data)

        # Calculate RMS for speech detection
        try:
            samples = [int.from_bytes(audio_data[i:i+2], 'little', signed=True)
                       for i in range(0, min(len(audio_data), 1920), 2)]
            rms = (sum(s*s for s in samples) / max(len(samples), 1)) ** 0.5 if samples else 0
        except:
            rms = 0

        # Log periodically
        if frame_count % 200 == 0:
            status = "SPEAKING" if is_speaking else "silent"
            logger.debug(f"Frame {frame_count}: RMS={rms:.0f}, buffer={len(audio_buffer)}, {status}")

        # Speech detection
        if rms > CONFIG["SPEECH_THRESHOLD"]:
            if not is_speaking:
                logger.info(f"Speech started (RMS={rms:.0f})")
            is_speaking = True
            silence_count = 0
            audio_buffer.extend(audio_data)

            # Prevent buffer from growing too large
            if len(audio_buffer) > CONFIG["MAX_AUDIO_BYTES"]:
                logger.info("Max buffer reached, processing...")
                async with processing_lock:
                    audio_copy = bytes(audio_buffer)
                    audio_buffer = bytearray()
                    is_speaking = False
                    asyncio.create_task(process_speech(ctx, audio_copy, participant_id))

        elif is_speaking:
            silence_count += 1
            audio_buffer.extend(audio_data)

            # End of speech detected
            if silence_count >= CONFIG["SILENCE_FRAMES_END"]:
                if len(audio_buffer) >= CONFIG["MIN_AUDIO_BYTES"]:
                    logger.info(f"Speech ended ({len(audio_buffer)} bytes)")
                    async with processing_lock:
                        audio_copy = bytes(audio_buffer)
                        asyncio.create_task(process_speech(ctx, audio_copy, participant_id))
                else:
                    logger.debug(f"Audio too short ({len(audio_buffer)} bytes), skipping")

                audio_buffer = bytearray()
                is_speaking = False
                silence_count = 0


async def process_speech(ctx: JobContext, audio_data: bytes, participant_id: str):
    """Full translation pipeline: STT → Translate → TTS → Send."""
    logger.info(f"=== Translating {len(audio_data)//1000}KB from {participant_id} ===")

    try:
        # Step 1: Speech-to-Text
        transcript, source_lang = await transcribe_audio(audio_data)
        if not transcript:
            logger.info("No speech detected")
            return

        logger.info(f"[STT] ({source_lang}) {transcript}")

        # Step 2: Translate
        translated, target_lang = await translate_text(transcript, source_lang)
        logger.info(f"[Translate] ({target_lang}) {translated}")

        # Step 3: Text-to-Speech
        audio_response = await synthesize_speech(translated, target_lang)
        if not audio_response:
            logger.error("TTS failed")
            return

        logger.info(f"[TTS] {len(audio_response)//1000}KB audio generated")

        # Step 4: Send to room via data channel
        await send_translation(ctx, transcript, translated, source_lang, target_lang, audio_response)

        logger.info("=== Translation sent ===")

    except Exception as e:
        logger.error(f"Translation error: {e}", exc_info=True)


async def send_translation(ctx: JobContext, original: str, translated: str,
                          source_lang: str, target_lang: str, audio: bytes):
    """Send translation to all participants via data channel."""
    audio_base64 = base64.b64encode(audio).decode('utf-8')

    # Chunk audio (LiveKit 64KB limit)
    CHUNK_SIZE = 48000
    chunks = [audio_base64[i:i+CHUNK_SIZE] for i in range(0, len(audio_base64), CHUNK_SIZE)]
    message_id = f"{asyncio.get_event_loop().time():.6f}"

    # Send metadata first
    metadata = {
        "type": "translation_start",
        "messageId": message_id,
        "originalText": original,
        "translatedText": translated,
        "sourceLang": source_lang,
        "targetLang": target_lang,
        "totalChunks": len(chunks),
    }
    await ctx.room.local_participant.publish_data(
        payload=json.dumps(metadata).encode('utf-8'),
        reliable=True,
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
        )
        # Small delay between chunks to prevent overwhelming
        if i < len(chunks) - 1:
            await asyncio.sleep(0.01)


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        ),
    )

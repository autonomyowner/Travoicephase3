import { NextRequest, NextResponse } from "next/server";

// Deepgram STT
async function speechToText(audioBuffer: Buffer): Promise<string> {
  console.log("Sending audio to Deepgram, buffer size:", audioBuffer.length);

  const response = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&detect_language=true&punctuate=true",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "audio/webm",
      },
      body: audioBuffer,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Deepgram error response:", errorText);
    throw new Error(`Deepgram error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Deepgram response:", JSON.stringify(data, null, 2));

  const transcript =
    data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
  const detectedLanguage =
    data.results?.channels?.[0]?.detected_language || "en";

  return JSON.stringify({ transcript, detectedLanguage });
}

// Gemini Translation
async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const langNames: Record<string, string> = {
    en: "English",
    ar: "Arabic",
  };

  const prompt = `Translate the following text from ${langNames[sourceLang] || sourceLang} to ${langNames[targetLang] || targetLang}. Only return the translated text, nothing else:\n\n${text}`;

  console.log("Translating with Gemini:", { text, sourceLang, targetLang });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini error:", errorText);
    throw new Error(`Gemini error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || text;
  console.log("Gemini translation result:", translatedText);
  return translatedText;
}

// ElevenLabs TTS
async function textToSpeech(
  text: string,
  targetLang: string
): Promise<Buffer> {
  // Use different voice IDs for different languages
  const voiceIds: Record<string, string> = {
    en: "21m00Tcm4TlvDq8ikWAM", // Rachel - English
    ar: "TX3LPaxmHKxFdv7VOQHJ", // Yosef - Arabic
  };

  const voiceId = voiceIds[targetLang] || voiceIds["en"];

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs error: ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const targetLang = (formData.get("targetLang") as string) || "en";

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Step 1: Speech to Text with language detection
    const sttResult = await speechToText(audioBuffer);
    const { transcript, detectedLanguage } = JSON.parse(sttResult);

    if (!transcript) {
      return NextResponse.json(
        { error: "No speech detected" },
        { status: 400 }
      );
    }

    // Determine source language (if Arabic detected, source is Arabic)
    const sourceLang = detectedLanguage === "ar" ? "ar" : "en";
    // Target is opposite of source for MVP
    const actualTargetLang = sourceLang === "ar" ? "en" : "ar";

    // Step 2: Translate
    const translatedText = await translateText(
      transcript,
      sourceLang,
      actualTargetLang
    );

    // Step 3: Text to Speech
    const audioOutput = await textToSpeech(translatedText, actualTargetLang);

    // Return audio as base64 along with metadata
    return NextResponse.json({
      originalText: transcript,
      sourceLang,
      translatedText,
      targetLang: actualTargetLang,
      audio: audioOutput.toString("base64"),
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    );
  }
}

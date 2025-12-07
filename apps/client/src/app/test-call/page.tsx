"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
} from "livekit-client";

type ConnectionState = "disconnected" | "connecting" | "connected";

interface Translation {
  id: string;
  original: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
}

export default function TranslationRoom() {
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [participants, setParticipants] = useState<string[]>([]);
  const [agentConnected, setAgentConnected] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isListening, setIsListening] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const remoteAudioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const audioChunkBufferRef = useRef<Map<string, { chunks: string[], totalChunks: number }>>(new Map());

  const addTranslation = useCallback((t: Omit<Translation, "id" | "timestamp">) => {
    setTranslations(prev => [{
      ...t,
      id: Date.now().toString(),
      timestamp: new Date(),
    }, ...prev].slice(0, 10)); // Keep last 10
  }, []);

  const joinRoom = async () => {
    if (!roomName.trim() || !userName.trim()) return;

    setConnectionState("connecting");

    try {
      const tokenRes = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: roomName.trim(), participantName: userName.trim() }),
      });

      if (!tokenRes.ok) throw new Error("Failed to get token");
      const { token } = await tokenRes.json();

      const room = new Room();
      roomRef.current = room;

      // Connection events
      room.on(RoomEvent.Connected, () => {
        setConnectionState("connected");
        updateParticipants(room);
        checkForAgent(room);
      });

      room.on(RoomEvent.Disconnected, () => {
        setConnectionState("disconnected");
        setParticipants([]);
        setAgentConnected(false);
        setIsListening(false);
        remoteAudioElementsRef.current.clear();
      });

      // Participant events
      room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        updateParticipants(room);
        if (isAgentParticipant(participant.identity)) {
          setAgentConnected(true);
        }
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        updateParticipants(room);
        const audioEl = remoteAudioElementsRef.current.get(participant.identity);
        if (audioEl) {
          audioEl.remove();
          remoteAudioElementsRef.current.delete(participant.identity);
        }
        if (isAgentParticipant(participant.identity)) {
          setAgentConnected(false);
        }
      });

      // Track events
      room.on(RoomEvent.TrackSubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            const audioElement = track.attach();
            audioElement.id = `audio-${participant.identity}`;
            document.body.appendChild(audioElement);
            remoteAudioElementsRef.current.set(participant.identity, audioElement);
          }
        }
      );

      room.on(RoomEvent.TrackUnsubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            track.detach().forEach((el) => el.remove());
            remoteAudioElementsRef.current.delete(participant.identity);
          }
        }
      );

      // Data channel for translations
      room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(payload));

          if (data.type === "translation_start") {
            setIsListening(false);
            addTranslation({
              original: data.originalText,
              translated: data.translatedText,
              sourceLang: data.sourceLang,
              targetLang: data.targetLang,
            });

            audioChunkBufferRef.current.set(data.messageId, {
              chunks: new Array(data.totalChunks).fill(""),
              totalChunks: data.totalChunks,
            });

          } else if (data.type === "translation_chunk") {
            const buffer = audioChunkBufferRef.current.get(data.messageId);
            if (buffer) {
              buffer.chunks[data.chunkIndex] = data.audio;
              const received = buffer.chunks.filter((c: string) => c !== "").length;

              if (received === buffer.totalChunks) {
                const fullAudio = buffer.chunks.join("");
                const audio = new Audio(`data:audio/mpeg;base64,${fullAudio}`);
                audio.play().catch(() => {});
                audioChunkBufferRef.current.delete(data.messageId);
              }
            }
          }
        } catch {}
      });

      // Audio activity indicator
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const userSpeaking = speakers.some(s => s.identity === userName);
        setIsListening(userSpeaking && agentConnected);
      });

      await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);
      await room.localParticipant.setMicrophoneEnabled(true);

    } catch (error) {
      console.error(error);
      setConnectionState("disconnected");
    }
  };

  const isAgentParticipant = (identity: string): boolean => {
    return identity.startsWith("agent-") || identity.toLowerCase().includes("agent");
  };

  const checkForAgent = (room: Room) => {
    for (const p of room.remoteParticipants.values()) {
      if (isAgentParticipant(p.identity)) {
        setAgentConnected(true);
        return;
      }
    }
  };

  const updateParticipants = (room: Room) => {
    setParticipants([
      room.localParticipant.identity,
      ...Array.from(room.remoteParticipants.values()).map((p) => p.identity),
    ]);
  };

  const leaveRoom = async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setConnectionState("disconnected");
    setParticipants([]);
    setAgentConnected(false);
    setTranslations([]);
    remoteAudioElementsRef.current.clear();
  };

  useEffect(() => {
    return () => {
      if (roomRef.current) roomRef.current.disconnect();
      remoteAudioElementsRef.current.forEach(audio => audio.remove());
    };
  }, []);

  // Landing / Join Form
  if (connectionState === "disconnected") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">TRAVoices</h1>
            <p className="text-white/60">Real-time voice translation</p>
          </div>

          <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
            <input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
            <button
              onClick={joinRoom}
              disabled={!roomName.trim() || !userName.trim()}
              className="w-full py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
            >
              Join Room
            </button>
          </div>

          <p className="text-center text-white/40 text-sm mt-6">
            Arabic ↔ English translation powered by AI
          </p>
        </div>
      </div>
    );
  }

  // Connecting
  if (connectionState === "connecting") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Connecting...</p>
        </div>
      </div>
    );
  }

  // Connected - Main UI
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <h1 className="text-white font-semibold">TRAVoices</h1>
          <p className="text-white/40 text-sm">Room: {roomName}</p>
        </div>
        <button
          onClick={leaveRoom}
          className="px-4 py-2 rounded-lg text-red-400 text-sm transition-colors hover:bg-red-500/10"
        >
          Leave
        </button>
      </header>

      {/* Status Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          {/* Agent Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${agentConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-500"}`}
            />
            <span className="text-sm text-white/70">
              {agentConnected ? "Translator active" : "Waiting for translator..."}
            </span>
          </div>

          {/* Listening Indicator */}
          {isListening && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20">
              <div className="flex gap-0.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-emerald-500 rounded-full animate-pulse"
                    style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-emerald-400">Listening...</span>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2">
          {participants.filter(p => !isAgentParticipant(p)).map((p) => (
            <div
              key={p}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
              title={p}
            >
              {p.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Translations */}
      <div className="flex-1 overflow-auto p-4">
        {translations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
              <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-white/80 font-medium mb-2">Ready to translate</h3>
            <p className="text-white/40 text-sm max-w-xs">
              {agentConnected
                ? "Speak naturally in English or Arabic. Your voice will be translated automatically."
                : "Waiting for the translation agent to connect..."}
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {translations.map((t) => (
              <div key={t.id} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                {/* Original */}
                <div className="px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      {t.sourceLang.toUpperCase()}
                    </span>
                    <span className="text-white/30 text-xs">Original</span>
                  </div>
                  <p className="text-white/80" style={{ direction: t.sourceLang === "ar" ? "rtl" : "ltr" }}>
                    {t.original}
                  </p>
                </div>

                {/* Translation */}
                <div className="px-4 py-3" style={{ background: "rgba(16, 185, 129, 0.05)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      {t.targetLang.toUpperCase()}
                    </span>
                    <span className="text-white/30 text-xs">Translation</span>
                  </div>
                  <p className="text-white text-lg" style={{ direction: t.targetLang === "ar" ? "rtl" : "ltr" }}>
                    {t.translated}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Instructions */}
      <footer className="px-4 py-3 border-t border-white/5 text-center">
        <p className="text-white/40 text-sm">
          {agentConnected
            ? "Speak clearly for 2-3 seconds, then pause. Translation will appear automatically."
            : "The translator will join automatically when you start speaking."}
        </p>
      </footer>
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
} from "livekit-client";
import { Button } from "@/components/ui/Button";

type ConnectionState = "loading" | "connecting" | "connected" | "disconnected";

interface CallData {
  token: string;
  roomId: string;
  roomCode: string;
  roomName: string;
  participantId: string;
  liveKitRoom: string;
  displayName: string;
  speaksLanguage: string;
  hearsLanguage: string;
  odentity: string;
  isGuest: boolean;
}

interface Translation {
  id: string;
  speakerName: string;
  original: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
}

interface ParticipantDisplay {
  identity: string;
  displayName: string;
  speaksLanguage?: string;
  hearsLanguage?: string;
  isAgent: boolean;
}

export default function CallPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [connectionState, setConnectionState] = useState<ConnectionState>("loading");
  const [callData, setCallData] = useState<CallData | null>(null);
  const [participants, setParticipants] = useState<ParticipantDisplay[]>([]);
  const [agentConnected, setAgentConnected] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);

  const roomRef = useRef<Room | null>(null);
  const remoteAudioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const audioChunkBufferRef = useRef<Map<string, { chunks: string[], totalChunks: number }>>(new Map());

  const addTranslation = useCallback((t: Omit<Translation, "id" | "timestamp">) => {
    setTranslations(prev => [{
      ...t,
      id: Date.now().toString(),
      timestamp: new Date(),
    }, ...prev].slice(0, 15)); // Keep last 15
  }, []);

  // Load call data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("callData");
    if (!stored) {
      router.push(`/rooms/${code}`);
      return;
    }
    try {
      const data = JSON.parse(stored) as CallData;
      if (data.roomCode !== code) {
        router.push(`/rooms/${code}`);
        return;
      }
      setCallData(data);
    } catch {
      router.push(`/rooms/${code}`);
    }
  }, [code, router]);

  // Connect to room when callData is available
  useEffect(() => {
    if (!callData) return;

    const connectToRoom = async () => {
      setConnectionState("connecting");

      try {
        const room = new Room();
        roomRef.current = room;

        // Connection events
        room.on(RoomEvent.Connected, () => {
          setConnectionState("connected");
          setCallStartTime(new Date());
          updateParticipants(room);
          checkForAgent(room);
        });

        room.on(RoomEvent.Disconnected, () => {
          setConnectionState("disconnected");
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

        // Track events - MUTE ORIGINAL AUDIO
        room.on(RoomEvent.TrackSubscribed,
          (track: RemoteTrack, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
            if (track.kind === Track.Kind.Audio) {
              const audioElement = track.attach();
              audioElement.id = `audio-${participant.identity}`;

              // CRITICAL: Mute original audio for non-agent participants
              // Users will hear only the translated audio from data channel
              if (!isAgentParticipant(participant.identity)) {
                audioElement.volume = 0;
                audioElement.muted = true;
              }

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

        // Data channel for translations - targeted messages
        room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
          try {
            const data = JSON.parse(new TextDecoder().decode(payload));

            if (data.type === "translation_start") {
              setIsListening(false);
              addTranslation({
                speakerName: data.speakerName || "Unknown",
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
          const userSpeaking = speakers.some(s => s.identity === callData.odentity);
          setIsListening(userSpeaking && agentConnected);
        });

        await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, callData.token);
        await room.localParticipant.setMicrophoneEnabled(true);

      } catch (error) {
        console.error("Connection error:", error);
        setConnectionState("disconnected");
      }
    };

    connectToRoom();

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, [callData, agentConnected, addTranslation]);

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
    const parseMetadata = (metadata: string | undefined) => {
      if (!metadata) return {};
      try {
        return JSON.parse(metadata);
      } catch {
        return {};
      }
    };

    const localMeta = parseMetadata(room.localParticipant.metadata);
    const participantList: ParticipantDisplay[] = [
      {
        identity: room.localParticipant.identity,
        displayName: localMeta.displayName || room.localParticipant.name || room.localParticipant.identity,
        speaksLanguage: localMeta.speaksLanguage || callData?.speaksLanguage,
        hearsLanguage: localMeta.hearsLanguage || callData?.hearsLanguage,
        isAgent: false,
      },
    ];

    for (const p of room.remoteParticipants.values()) {
      const meta = parseMetadata(p.metadata);
      participantList.push({
        identity: p.identity,
        displayName: meta.displayName || p.name || p.identity,
        speaksLanguage: meta.speaksLanguage,
        hearsLanguage: meta.hearsLanguage,
        isAgent: isAgentParticipant(p.identity),
      });
    }

    setParticipants(participantList);
  };

  const leaveRoom = async () => {
    // Save call history
    if (callData && callStartTime) {
      try {
        const participantsData = participants
          .filter(p => !p.isAgent)
          .map(p => ({
            odentity: p.identity,
            displayName: p.displayName,
            spokeLanguage: p.speaksLanguage || "en",
            heardLanguage: p.hearsLanguage || "ar",
          }));

        await fetch("/api/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: callData.roomId,
            roomCode: callData.roomCode,
            roomName: callData.roomName,
            startedAt: callStartTime.toISOString(),
            endedAt: new Date().toISOString(),
            participants: participantsData,
          }),
        });
      } catch (e) {
        console.error("Failed to save call history:", e);
      }
    }

    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }

    // Clear session data
    sessionStorage.removeItem("callData");

    router.push("/dashboard");
  };

  // Cleanup on unmount
  useEffect(() => {
    const audioElements = remoteAudioElementsRef.current;
    return () => {
      audioElements.forEach(audio => audio.remove());
    };
  }, []);

  // Loading state
  if (connectionState === "loading" || !callData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
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
          <p className="text-white/60">Connecting to {callData.roomName}...</p>
        </div>
      </div>
    );
  }

  // Disconnected
  if (connectionState === "disconnected") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Disconnected</h1>
          <p className="text-white/60 mb-6">You have left the call</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Connected - Main Call UI
  const humanParticipants = participants.filter(p => !p.isAgent);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <h1 className="text-white font-semibold">{callData.roomName}</h1>
          <p className="text-white/40 text-sm">Code: {callData.roomCode}</p>
        </div>
        <Button variant="danger" size="sm" onClick={leaveRoom}>
          Leave Call
        </Button>
      </header>

      {/* Participants Bar */}
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

        {/* Participants with language badges */}
        <div className="flex items-center gap-3">
          {humanParticipants.map((p) => (
            <div key={p.identity} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ background: p.identity === callData.odentity
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                }}
                title={p.displayName}
              >
                {p.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-white/80 text-sm">{p.displayName}</p>
                <p className="text-white/40 text-xs">
                  {p.speaksLanguage?.toUpperCase()} → {p.hearsLanguage?.toUpperCase()}
                </p>
              </div>
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
                ? "Speak naturally. When someone speaks, you will hear the translated audio."
                : "Waiting for the translation agent to connect..."}
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {translations.map((t) => (
              <div key={t.id} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                {/* Speaker + Original */}
                <div className="px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white/80">{t.speakerName}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      {t.sourceLang.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white/60" style={{ direction: t.sourceLang === "ar" ? "rtl" : "ltr" }}>
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

      {/* Footer */}
      <footer className="px-4 py-3 border-t border-white/5">
        <div className="flex items-center justify-between text-white/40 text-sm">
          <span>
            You speak: {callData.speaksLanguage.toUpperCase()} | You hear: {callData.hearsLanguage.toUpperCase()}
          </span>
          <span>
            Original audio is muted - you hear translations only
          </span>
        </div>
      </footer>
    </div>
  );
}

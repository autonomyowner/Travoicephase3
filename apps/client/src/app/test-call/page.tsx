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
  speakerName: string;
  original: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
}

export default function TranslationRoom() {
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [speaksLanguage, setSpeaksLanguage] = useState("en");
  const [hearsLanguage, setHearsLanguage] = useState("fr");
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [participants, setParticipants] = useState<string[]>([]);
  const [agentConnected, setAgentConnected] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const remoteAudioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const addTranslation = useCallback((t: Omit<Translation, "id" | "timestamp">) => {
    setTranslations(prev => [{
      ...t,
      id: Date.now().toString(),
      timestamp: new Date(),
    }, ...prev].slice(0, 15));
    setTranslationError(null);
  }, []);

  const joinRoom = async () => {
    if (!roomName.trim() || !userName.trim()) return;

    setConnectionState("connecting");

    try {
      // Build metadata for language preferences
      const metadata = JSON.stringify({
        displayName: userName.trim(),
        speaksLanguage,
        hearsLanguage,
      });

      const tokenRes = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: roomName.trim(),
          participantName: userName.trim(),
          metadata,
        }),
      });

      if (!tokenRes.ok) throw new Error("Failed to get token");
      const { token } = await tokenRes.json();

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
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
        // Clean up any audio elements for this participant
        remoteAudioElementsRef.current.forEach((el, key) => {
          if (key.startsWith(participant.identity)) {
            el.remove();
            remoteAudioElementsRef.current.delete(key);
          }
        });
        if (isAgentParticipant(participant.identity)) {
          setAgentConnected(false);
        }
      });

      // Track events - ONLY subscribe to agent's translated audio tracks
      room.on(RoomEvent.TrackSubscribed,
        (track: RemoteTrack, pub: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            // ONLY attach audio for agent participants
            // Users will NEVER hear each other's original audio
            if (!isAgentParticipant(participant.identity)) {
              console.log(`Ignoring audio track from non-agent: ${participant.identity}`);
              return;
            }

            // Check if this track is for us (translated_for_{our_identity})
            const trackName = pub.trackName || "";
            const myIdentity = userName.trim();

            // If track has a name, verify it's for us
            if (trackName && !trackName.includes(myIdentity)) {
              console.log(`Ignoring audio track not for us: ${trackName}`);
              return;
            }

            console.log(`Attaching translated audio track: ${trackName || "agent-audio"}`);
            const audioElement = track.attach();
            audioElement.id = `audio-${participant.identity}-${trackName}`;

            document.body.appendChild(audioElement);
            remoteAudioElementsRef.current.set(`${participant.identity}-${trackName}`, audioElement);
          }
        }
      );

      room.on(RoomEvent.TrackUnsubscribed,
        (track: RemoteTrack, pub: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            track.detach().forEach((el) => el.remove());
            const trackName = pub.trackName || "";
            remoteAudioElementsRef.current.delete(`${participant.identity}-${trackName}`);
          }
        }
      );

      // Data channel for translation TEXT (audio comes via track)
      room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(payload));

          if (data.type === "translation_text") {
            // Text-only message - audio comes via agent's published track
            setIsListening(false);
            addTranslation({
              speakerName: data.speakerName || "Unknown",
              original: data.originalText,
              translated: data.translatedText,
              sourceLang: data.sourceLang,
              targetLang: data.targetLang,
            });
          } else if (data.type === "translation_error") {
            // Handle translation errors silently
            console.error("Translation error:", data.error);
            setTranslationError(data.error);
            setTimeout(() => setTranslationError(null), 5000);
          }
        } catch (e) {
          console.error("Failed to parse data channel message:", e);
        }
      });

      // Audio activity indicator
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const userSpeaking = speakers.some(s => s.identity === userName.trim());
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
    setTranslationError(null);
    remoteAudioElementsRef.current.clear();
  };

  useEffect(() => {
    const audioElements = remoteAudioElementsRef.current;
    const room = roomRef.current;
    return () => {
      if (room) room.disconnect();
      audioElements.forEach(audio => audio.remove());
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
            />
            <input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />

            {/* Language Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-sm mb-1 block">I speak</label>
                <select
                  value={speaksLanguage}
                  onChange={(e) => setSpeaksLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1 block">I want to hear</label>
                <select
                  value={hearsLanguage}
                  onChange={(e) => setHearsLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <option value="fr">French</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

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
            Voice replacement: You only hear translated audio
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

          {/* Error Indicator */}
          {translationError && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20">
              <span className="text-xs text-red-400">Translation error</span>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2">
          {participants.filter(p => !isAgentParticipant(p)).map((p) => (
            <div
              key={p}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ background: p === userName ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
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
                ? "Speak naturally. You will hear translated audio from other participants."
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
                  <p className="text-white/60">
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
                  <p className="text-white text-lg">
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
            You speak: {speaksLanguage.toUpperCase()} | You hear: {hearsLanguage.toUpperCase()}
          </span>
          <span>
            Voice replacement active - you hear translations only
          </span>
        </div>
      </footer>
    </div>
  );
}

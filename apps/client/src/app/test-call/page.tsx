"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  RemoteTrackPublication,
  DataPacket_Kind,
  RemoteTrack,
} from "livekit-client";

type ConnectionState = "disconnected" | "connecting" | "connected";

export default function TestCallPage() {
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [participants, setParticipants] = useState<string[]>([]);
  const [agentActive, setAgentActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [translationResult, setTranslationResult] = useState<{
    originalText: string;
    translatedText: string;
    sourceLang: string;
    targetLang: string;
  } | null>(null);
  const [remoteAudioMuted, setRemoteAudioMuted] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const remoteAudioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const translatedAudioRef = useRef<HTMLAudioElement | null>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-50), `[${timestamp}] ${message}`]);
  }, []);

  // Mute/unmute remote audio elements (raw voice from other participants)
  const setRemoteAudioVolume = useCallback((muted: boolean) => {
    remoteAudioElementsRef.current.forEach((audio) => {
      audio.volume = muted ? 0 : 1;
    });
    setRemoteAudioMuted(muted);
  }, []);

  const joinRoom = async () => {
    if (!roomName || !userName) {
      addLog("Please enter room name and your name");
      return;
    }

    setConnectionState("connecting");
    addLog(`Joining room: ${roomName}...`);

    try {
      const tokenRes = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, participantName: userName }),
      });

      if (!tokenRes.ok) throw new Error("Failed to get token");
      const { token } = await tokenRes.json();

      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.Connected, () => {
        addLog("Connected to room!");
        setConnectionState("connected");
        updateParticipants(room);
      });

      room.on(RoomEvent.Disconnected, () => {
        addLog("Disconnected from room");
        setConnectionState("disconnected");
        setParticipants([]);
        remoteAudioElementsRef.current.clear();
      });

      room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        addLog(`${participant.identity} joined`);
        updateParticipants(room);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        addLog(`${participant.identity} left`);
        updateParticipants(room);
        // Clean up their audio element
        const audioEl = remoteAudioElementsRef.current.get(participant.identity);
        if (audioEl) {
          audioEl.remove();
          remoteAudioElementsRef.current.delete(participant.identity);
        }
      });

      room.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, _publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            const audioElement = track.attach();
            audioElement.id = `audio-${participant.identity}`;
            // If agent is active, mute the raw audio
            audioElement.volume = agentActive ? 0 : 1;
            document.body.appendChild(audioElement);
            remoteAudioElementsRef.current.set(participant.identity, audioElement);
            addLog(`Subscribed to ${participant.identity}'s audio`);
          }
        }
      );

      room.on(
        RoomEvent.TrackUnsubscribed,
        (track: RemoteTrack, _publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            track.detach().forEach((el) => el.remove());
            remoteAudioElementsRef.current.delete(participant.identity);
          }
        }
      );

      // Listen for translated audio data from other participants
      room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
        if (!participant || !agentActive) return;

        try {
          const decoder = new TextDecoder();
          const data = JSON.parse(decoder.decode(payload));

          if (data.type === "translated_audio") {
            addLog(`Received translation from ${participant.identity}`);

            // Update translation result display
            setTranslationResult({
              originalText: data.originalText,
              translatedText: data.translatedText,
              sourceLang: data.sourceLang,
              targetLang: data.targetLang,
            });

            // Play the translated audio
            const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
            translatedAudioRef.current = audio;
            audio.play().catch(e => addLog(`Audio play error: ${e.message}`));
          }
        } catch (e) {
          // Ignore non-JSON data
        }
      });

      await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);

      try {
        await room.localParticipant.setMicrophoneEnabled(true);
        addLog("Microphone enabled");
      } catch (micError) {
        if (micError instanceof Error && micError.name === "NotFoundError") {
          addLog("No microphone found - you can still hear others");
        }
      }
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : "Failed to join"}`);
      setConnectionState("disconnected");
    }
  };

  const updateParticipants = (room: Room) => {
    const participantList = [
      room.localParticipant.identity,
      ...Array.from(room.remoteParticipants.values()).map((p) => p.identity),
    ];
    setParticipants(participantList);
  };

  const leaveRoom = async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setConnectionState("disconnected");
    setParticipants([]);
    setAgentActive(false);
    remoteAudioElementsRef.current.clear();
    addLog("Left the room");
  };

  const startRecording = async () => {
    if (!agentActive) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());
        if (audioBlob.size < 1000) {
          addLog("Audio too short");
          return;
        }
        await sendForTranslation(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (error) {
      addLog(`Mic error: ${error instanceof Error ? error.message : "Failed"}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendForTranslation = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/translate", { method: "POST", body: formData });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Translation failed");
      }

      const result = await response.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      // Update local display
      setTranslationResult({
        originalText: result.originalText,
        translatedText: result.translatedText,
        sourceLang: result.sourceLang,
        targetLang: result.targetLang,
      });

      addLog(`[${elapsed}s] You said: "${result.originalText}"`);
      addLog(`[${elapsed}s] Translated: "${result.translatedText}"`);

      // Send translated audio to other participants via LiveKit data channel
      if (roomRef.current) {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify({
          type: "translated_audio",
          originalText: result.originalText,
          translatedText: result.translatedText,
          sourceLang: result.sourceLang,
          targetLang: result.targetLang,
          audio: result.audio,
        }));

        await roomRef.current.localParticipant.publishData(data, {
          reliable: true,
        });
        addLog("Sent translation to other participants");
      }

    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : "Failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAgent = useCallback(() => {
    const newState = !agentActive;
    setAgentActive(newState);

    // When agent is active, mute raw remote audio (they'll hear translated version)
    setRemoteAudioVolume(newState);

    if (newState) {
      addLog("Agent ON - Your friend will hear translated audio");
    } else {
      addLog("Agent OFF - Normal voice call");
    }
  }, [agentActive, setRemoteAudioVolume, addLog]);

  useEffect(() => {
    return () => {
      if (roomRef.current) roomRef.current.disconnect();
      remoteAudioElementsRef.current.forEach(audio => audio.remove());
    };
  }, []);

  // Audio wave bars for visualization
  const AudioWave = ({ color, isActive }: { color: "matcha" | "terra"; isActive: boolean }) => {
    const heights = [24, 42, 30, 54, 36, 48, 30, 42];
    const baseColor = color === "matcha" ? "var(--matcha" : "var(--terra";

    return (
      <div className="flex items-end gap-1 h-20">
        {heights.map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full transition-all duration-300"
            style={{
              height: isActive ? `${h}px` : "8px",
              background: `linear-gradient(to top, ${baseColor}-600), ${baseColor}-300))`,
              animation: isActive ? `audioWave ${0.6 + i * 0.08}s ease-in-out ${i * 0.08}s infinite alternate` : "none",
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        @keyframes audioWave {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1); }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes travel {
          0% { left: 0%; }
          100% { left: 100%; }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>

      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
        {/* Ambient background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, var(--matcha-500) 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, var(--terra-400) 0%, transparent 70%)", filter: "blur(80px)" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-dm-serif)" }}>
              Translation Test Room
            </h1>
            <p className="text-white/60 text-lg">Real-time Arabic ↔ English voice translation</p>
          </div>

          {/* Connection Panel */}
          {connectionState === "disconnected" && (
            <div className="max-w-md mx-auto mb-12 animate-fade-in">
              <div className="backdrop-blur-xl rounded-3xl p-8" style={{
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(104, 166, 125, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)"
              }}>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Room Name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl text-white placeholder-white/40 outline-none transition-all"
                    style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(104, 166, 125, 0.3)" }}
                  />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl text-white placeholder-white/40 outline-none transition-all"
                    style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(104, 166, 125, 0.3)" }}
                  />
                  <button
                    onClick={joinRoom}
                    className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, var(--matcha-500) 0%, var(--matcha-600) 100%)",
                      boxShadow: "0 4px 20px rgba(104, 166, 125, 0.4)"
                    }}
                  >
                    Join Room
                  </button>
                </div>
              </div>
            </div>
          )}

          {connectionState === "connecting" && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: "var(--matcha-500)", borderTopColor: "transparent" }} />
              <p className="mt-6 text-white/70 text-lg">Connecting...</p>
            </div>
          )}

          {/* Main Translation Interface */}
          {connectionState === "connected" && (
            <div className="animate-fade-in">
              {/* Participant Avatars */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-8">
                {/* English Speaker */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {(isRecording || isProcessing) && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: "rgba(104, 166, 125, 0.4)", animation: "pulseRing 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
                        <div className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: "rgba(104, 166, 125, 0.4)", animation: "pulseRing 3s cubic-bezier(0.4, 0, 0.6, 1) 0.4s infinite" }} />
                      </>
                    )}
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center relative"
                      style={{
                        background: "linear-gradient(135deg, var(--matcha-400) 0%, var(--matcha-600) 100%)",
                        boxShadow: "0 0 60px rgba(104, 166, 125, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.2)"
                      }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 md:w-14 md:h-14">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="22" />
                      </svg>
                      {(isRecording || isProcessing) && (
                        <div className="absolute inset-3 rounded-full"
                          style={{ background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)", animation: "pulseGlow 2s ease-in-out infinite" }} />
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-1.5 rounded-full backdrop-blur-sm"
                    style={{ background: "rgba(104, 166, 125, 0.15)", border: "1px solid rgba(104, 166, 125, 0.3)" }}>
                    <span className="text-sm font-bold tracking-wider" style={{ color: "var(--matcha-300)" }}>EN</span>
                  </div>
                  <AudioWave color="matcha" isActive={isRecording} />
                </div>

                {/* Center - Translation Flow */}
                <div className="flex flex-col items-center gap-6 flex-1 max-w-sm">
                  <div className="relative w-full h-0.5 hidden md:block">
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="absolute inset-0" style={{
                        background: "linear-gradient(90deg, transparent 0%, var(--matcha-500) 20%, var(--terra-400) 50%, var(--matcha-500) 80%, transparent 100%)",
                        animation: "shimmer 3s ease-in-out infinite"
                      }} />
                    </div>
                    {isProcessing && (
                      <>
                        <div className="absolute top-1/2 w-3 h-3 rounded-full -translate-y-1/2"
                          style={{ background: "var(--matcha-400)", boxShadow: "0 0 15px var(--matcha-400)", animation: "travel 2.5s linear infinite" }} />
                        <div className="absolute top-1/2 w-3 h-3 rounded-full -translate-y-1/2"
                          style={{ background: "var(--terra-400)", boxShadow: "0 0 15px var(--terra-400)", animation: "travel 3s linear 0.8s infinite" }} />
                      </>
                    )}
                  </div>

                  <div className="w-full px-6 py-5 rounded-2xl backdrop-blur-md"
                    style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(104, 166, 125, 0.2)", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full"
                          style={{ background: agentActive ? "#10b981" : "#6b7280", boxShadow: agentActive ? "0 0 12px #10b981" : "none", animation: agentActive ? "pulseDot 1.5s ease-in-out infinite" : "none" }} />
                        <span className="text-sm font-medium text-white/90">
                          {agentActive ? "Translation Active" : "Normal Call"}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-xs font-mono" style={{ color: "var(--matcha-300)" }}>EN</span>
                        <svg width="60" height="12" viewBox="0 0 60 12" className="flex-shrink-0">
                          <defs>
                            <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="var(--matcha-400)" />
                              <stop offset="100%" stopColor="var(--terra-400)" />
                            </linearGradient>
                          </defs>
                          <path d="M2 6 L50 6 M45 2 L50 6 L45 10" stroke="url(#arrowGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                        <span className="text-xs font-mono" style={{ color: "var(--terra-300)" }}>AR</span>
                      </div>
                      {agentActive && (
                        <div className="text-center text-xs text-white/50">
                          Raw voice muted • Translations only
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arabic Speaker */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {isProcessing && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: "rgba(198, 123, 94, 0.4)", animation: "pulseRing 2.5s cubic-bezier(0.4, 0, 0.6, 1) 0.3s infinite" }} />
                        <div className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: "rgba(198, 123, 94, 0.4)", animation: "pulseRing 3s cubic-bezier(0.4, 0, 0.6, 1) 0.7s infinite" }} />
                      </>
                    )}
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center relative"
                      style={{
                        background: "linear-gradient(135deg, var(--terra-400) 0%, var(--terra-600) 100%)",
                        boxShadow: "0 0 60px rgba(198, 123, 94, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.2)"
                      }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 md:w-14 md:h-14">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="22" />
                      </svg>
                      {isProcessing && (
                        <div className="absolute inset-3 rounded-full"
                          style={{ background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)", animation: "pulseGlow 2s ease-in-out 0.3s infinite" }} />
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-1.5 rounded-full backdrop-blur-sm"
                    style={{ background: "rgba(198, 123, 94, 0.15)", border: "1px solid rgba(198, 123, 94, 0.3)" }}>
                    <span className="text-sm font-bold tracking-wider" style={{ color: "var(--terra-300)" }}>AR</span>
                  </div>
                  <AudioWave color="terra" isActive={isProcessing} />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <button
                  onClick={toggleAgent}
                  className="px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
                  style={{
                    background: agentActive ? "linear-gradient(135deg, var(--matcha-500), var(--terra-400))" : "rgba(255, 255, 255, 0.1)",
                    border: agentActive ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    boxShadow: agentActive ? "0 4px 20px rgba(104, 166, 125, 0.4)" : "none"
                  }}
                >
                  {agentActive ? "Translation ON" : "Enable Translation"}
                </button>

                <button
                  onClick={leaveRoom}
                  className="px-6 py-4 rounded-xl font-medium transition-all hover:scale-105"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#fca5a5"
                  }}
                >
                  Leave Room
                </button>
              </div>

              {/* Participants */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                {participants.map((p) => (
                  <span key={p} className="px-3 py-1 rounded-full text-sm"
                    style={{ background: "rgba(255, 255, 255, 0.1)", color: "rgba(255,255,255,0.8)" }}>
                    {p} {p === userName && "(you)"}
                  </span>
                ))}
              </div>

              {/* Push-to-Talk Panel (only when agent is active) */}
              {agentActive && (
                <div className="max-w-lg mx-auto mb-8 animate-fade-in">
                  <div className="rounded-3xl p-6 backdrop-blur-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(104, 166, 125, 0.1) 0%, rgba(198, 123, 94, 0.1) 100%)",
                      border: "2px solid rgba(104, 166, 125, 0.3)"
                    }}>
                    <p className="text-white/60 text-sm text-center mb-6">
                      Hold to speak - your friend will hear the translation
                    </p>

                    <div className="flex justify-center mb-6">
                      <button
                        onMouseDown={!isProcessing ? startRecording : undefined}
                        onMouseUp={!isProcessing ? stopRecording : undefined}
                        onMouseLeave={!isProcessing ? stopRecording : undefined}
                        onTouchStart={!isProcessing ? startRecording : undefined}
                        onTouchEnd={!isProcessing ? stopRecording : undefined}
                        disabled={isProcessing}
                        className="relative w-32 h-32 rounded-full flex items-center justify-center transition-all"
                        style={{
                          background: isProcessing
                            ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                            : isRecording
                              ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                              : "linear-gradient(135deg, var(--matcha-500) 0%, var(--matcha-600) 100%)",
                          boxShadow: isRecording
                            ? "0 0 40px rgba(239, 68, 68, 0.6)"
                            : isProcessing
                              ? "0 0 40px rgba(245, 158, 11, 0.6)"
                              : "0 0 40px rgba(104, 166, 125, 0.4)",
                          transform: isRecording ? "scale(1.1)" : "scale(1)",
                          cursor: isProcessing ? "wait" : "pointer"
                        }}
                      >
                        {isProcessing ? (
                          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-12 h-12">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <p className="text-center text-sm" style={{ color: isProcessing ? "#fbbf24" : isRecording ? "#fca5a5" : "var(--matcha-300)" }}>
                      {isProcessing ? "Translating & sending..." : isRecording ? "Recording..." : "Hold to speak"}
                    </p>

                    {translationResult && (
                      <div className="mt-6 space-y-3">
                        <div className="p-4 rounded-xl" style={{ background: "rgba(104, 166, 125, 0.1)", border: "1px solid rgba(104, 166, 125, 0.2)" }}>
                          <div className="text-xs mb-1" style={{ color: "var(--matcha-300)" }}>
                            Original ({translationResult.sourceLang.toUpperCase()})
                          </div>
                          <div className="text-white">{translationResult.originalText}</div>
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: "rgba(198, 123, 94, 0.1)", border: "1px solid rgba(198, 123, 94, 0.2)" }}>
                          <div className="text-xs mb-1" style={{ color: "var(--terra-300)" }}>
                            Translated ({translationResult.targetLang.toUpperCase()})
                          </div>
                          <div className="text-white" style={{ direction: translationResult.targetLang === "ar" ? "rtl" : "ltr" }}>
                            {translationResult.translatedText}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Log */}
              <div className="max-w-2xl mx-auto">
                <div className="rounded-2xl p-4 backdrop-blur-sm"
                  style={{ background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                  <div className="text-xs text-white/40 mb-3">Activity Log</div>
                  <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-xs">
                    {logs.length === 0 ? (
                      <div className="text-white/30">Waiting for activity...</div>
                    ) : (
                      logs.map((log, i) => (
                        <div key={i} className="text-white/60">{log}</div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

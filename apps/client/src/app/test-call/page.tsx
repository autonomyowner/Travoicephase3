"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  RemoteTrackPublication,
} from "livekit-client";

type ConnectionState = "disconnected" | "connecting" | "connected";

export default function TestCallPage() {
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [participants, setParticipants] = useState<string[]>([]);
  const [agentActive, setAgentActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [translationResult, setTranslationResult] = useState<{
    originalText: string;
    translatedText: string;
    sourceLang: string;
    targetLang: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-50), `[${timestamp}] ${message}`]);
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
      });

      room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        addLog(`${participant.identity} joined`);
        updateParticipants(room);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        addLog(`${participant.identity} left`);
        updateParticipants(room);
      });

      room.on(
        RoomEvent.TrackSubscribed,
        (track, _publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            const audioElement = track.attach();
            audioElement.id = `audio-${participant.identity}`;
            document.body.appendChild(audioElement);
          }
        }
      );

      room.on(
        RoomEvent.TrackUnsubscribed,
        (track, _publication: RemoteTrackPublication, _participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            track.detach().forEach((el) => el.remove());
          }
        }
      );

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
    addLog("Left the room");
  };

  const toggleMute = async () => {
    if (roomRef.current?.localParticipant) {
      const newMuteState = !isMuted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!newMuteState);
      setIsMuted(newMuteState);
      addLog(newMuteState ? "Muted" : "Unmuted");
    }
  };

  const startRecording = async () => {
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

      setTranslationResult({
        originalText: result.originalText,
        translatedText: result.translatedText,
        sourceLang: result.sourceLang,
        targetLang: result.targetLang,
      });

      addLog(`[${elapsed}s] ${result.sourceLang.toUpperCase()}: "${result.originalText}"`);
      addLog(`[${elapsed}s] ${result.targetLang.toUpperCase()}: "${result.translatedText}"`);

      const audio = new Audio(`data:audio/mpeg;base64,${result.audio}`);
      audio.play();
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : "Failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAgent = () => {
    setAgentActive(!agentActive);
    addLog(agentActive ? "Agent off" : "Agent activated");
  };

  useEffect(() => {
    return () => { if (roomRef.current) roomRef.current.disconnect(); };
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
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
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(104, 166, 125, 0.3)",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl text-white placeholder-white/40 outline-none transition-all"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(104, 166, 125, 0.3)",
                    }}
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
                    {/* Pulse rings */}
                    {(isRecording || isProcessing) && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: "rgba(104, 166, 125, 0.4)", animation: "pulseRing 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
                        <div className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: "rgba(104, 166, 125, 0.4)", animation: "pulseRing 3s cubic-bezier(0.4, 0, 0.6, 1) 0.4s infinite" }} />
                        <div className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: "rgba(104, 166, 125, 0.4)", animation: "pulseRing 3.5s cubic-bezier(0.4, 0, 0.6, 1) 0.8s infinite" }} />
                      </>
                    )}
                    {/* Avatar */}
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
                  {/* Language badge */}
                  <div className="px-4 py-1.5 rounded-full backdrop-blur-sm"
                    style={{ background: "rgba(104, 166, 125, 0.15)", border: "1px solid rgba(104, 166, 125, 0.3)" }}>
                    <span className="text-sm font-bold tracking-wider" style={{ color: "var(--matcha-300)" }}>EN</span>
                  </div>
                  {/* Audio wave */}
                  <AudioWave color="matcha" isActive={isRecording} />
                </div>

                {/* Center - Translation Flow */}
                <div className="flex flex-col items-center gap-6 flex-1 max-w-sm">
                  {/* Connection line */}
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

                  {/* Status card */}
                  <div className="w-full px-6 py-5 rounded-2xl backdrop-blur-md"
                    style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(104, 166, 125, 0.2)", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}>
                    <div className="flex flex-col gap-4">
                      {/* Live indicator */}
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full"
                          style={{ background: agentActive ? "#10b981" : "#6b7280", boxShadow: agentActive ? "0 0 12px #10b981" : "none", animation: agentActive ? "pulseDot 1.5s ease-in-out infinite" : "none" }} />
                        <span className="text-sm font-medium text-white/90">
                          {agentActive ? "Live Translation" : "Agent Standby"}
                        </span>
                      </div>
                      {/* Language direction */}
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
                      {/* Feature badges */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: "rgba(104, 166, 125, 0.2)", color: "var(--matcha-300)", border: "1px solid rgba(104, 166, 125, 0.3)" }}>
                          Voice Clone
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: "rgba(198, 123, 94, 0.2)", color: "var(--terra-300)", border: "1px solid rgba(198, 123, 94, 0.3)" }}>
                          Context-Aware
                        </span>
                      </div>
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
                  onClick={toggleMute}
                  className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                  style={{
                    background: isMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(104, 166, 125, 0.2)",
                    border: `1px solid ${isMuted ? "rgba(239, 68, 68, 0.4)" : "rgba(104, 166, 125, 0.4)"}`,
                    color: isMuted ? "#fca5a5" : "var(--matcha-300)"
                  }}
                >
                  {isMuted ? "Unmute" : "Mute"}
                </button>

                <button
                  onClick={toggleAgent}
                  className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                  style={{
                    background: agentActive ? "linear-gradient(135deg, var(--matcha-500), var(--terra-400))" : "rgba(255, 255, 255, 0.1)",
                    border: agentActive ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    boxShadow: agentActive ? "0 4px 20px rgba(104, 166, 125, 0.4)" : "none"
                  }}
                >
                  {agentActive ? "Agent Active" : "Start Agent"}
                </button>

                <button
                  onClick={leaveRoom}
                  className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#fca5a5"
                  }}
                >
                  Leave
                </button>
              </div>

              {/* Participants */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                {participants.map((p) => (
                  <span key={p} className="px-3 py-1 rounded-full text-sm"
                    style={{ background: "rgba(255, 255, 255, 0.1)", color: "white/80" }}>
                    {p} {p === userName && "(you)"}
                  </span>
                ))}
              </div>

              {/* Translation Agent Panel */}
              {agentActive && (
                <div className="max-w-lg mx-auto mb-8 animate-fade-in">
                  <div className="rounded-3xl p-6 backdrop-blur-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(104, 166, 125, 0.1) 0%, rgba(198, 123, 94, 0.1) 100%)",
                      border: "2px solid rgba(104, 166, 125, 0.3)"
                    }}>
                    <p className="text-white/60 text-sm text-center mb-6">
                      Hold to speak in English or Arabic
                    </p>

                    {/* Big push-to-talk button */}
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
                      {isProcessing ? "Translating..." : isRecording ? "Recording..." : "Hold to speak"}
                    </p>

                    {/* Translation result */}
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

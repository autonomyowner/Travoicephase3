"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LanguageSelector, LanguageCode } from "@/components/ui/LanguageSelector";

interface RoomInfo {
  id: string;
  code: string;
  name: string;
  maxParticipants: number;
  currentParticipants: number;
}

export default function RoomLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const { user, isLoaded } = useUser();

  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [speaksLanguage, setSpeaksLanguage] = useState<LanguageCode>("en");
  const [hearsLanguage, setHearsLanguage] = useState<LanguageCode>("fr");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Load room info
  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`/api/rooms/${code}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Room not found. Please check the code and try again.");
          } else if (res.status === 410) {
            setError("This room is no longer active.");
          } else {
            setError("Failed to load room");
          }
          return;
        }
        const data = await res.json();
        setRoom(data);
      } catch {
        setError("Failed to load room");
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [code]);

  // Pre-fill user name and language preferences
  useEffect(() => {
    if (user?.firstName) {
      setDisplayName(user.firstName);
    }
    // Check sessionStorage for preferences from create page
    const savedSpeaks = sessionStorage.getItem("preferredSpeaksLanguage") as LanguageCode;
    const savedHears = sessionStorage.getItem("preferredHearsLanguage") as LanguageCode;
    if (savedSpeaks) setSpeaksLanguage(savedSpeaks);
    if (savedHears) setHearsLanguage(savedHears);
  }, [user]);

  const handleJoin = async () => {
    if (!displayName.trim()) {
      setJoinError("Please enter your name");
      return;
    }

    setIsJoining(true);
    setJoinError("");

    try {
      // Generate guest ID if not authenticated
      let guestId = sessionStorage.getItem("guestId");
      if (!user && !guestId) {
        guestId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        sessionStorage.setItem("guestId", guestId);
      }

      const res = await fetch(`/api/rooms/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          speaksLanguage,
          hearsLanguage,
          guestId: user ? undefined : guestId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join room");
      }

      const joinData = await res.json();

      // Store join data in sessionStorage for the call page
      sessionStorage.setItem("callData", JSON.stringify({
        token: joinData.token,
        roomId: joinData.roomId,
        roomCode: joinData.roomCode,
        roomName: joinData.roomName,
        participantId: joinData.participantId,
        liveKitRoom: joinData.liveKitRoom,
        displayName: displayName.trim(),
        speaksLanguage,
        hearsLanguage,
        odentity: joinData.odentity,
        isGuest: joinData.isGuest,
      }));

      // Navigate to call page
      router.push(`/rooms/${code}/call`);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  const copyShareLink = async () => {
    const shareUrl = `${window.location.origin}/rooms/${code}`;
    await navigator.clipboard.writeText(shareUrl);
  };

  // Loading state
  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading room...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239, 68, 68, 0.2)" }}>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Room Not Available</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Room lobby
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <div className="w-full max-w-md">
        {/* Room Info Header */}
        <div className="text-center mb-8">
          <p className="text-emerald-400 text-sm font-medium mb-2">Room Code: {code}</p>
          <h1 className="text-3xl font-bold text-white mb-2">{room?.name}</h1>
          <p className="text-white/60">
            {room?.currentParticipants} / {room?.maxParticipants} participants
          </p>
        </div>

        <div className="rounded-2xl p-6 space-y-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {/* Display Name */}
          <Input
            label="Your Name"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            hint={user ? "Signed in as " + (user.emailAddresses?.[0]?.emailAddress || "") : "Joining as guest"}
          />

          {/* Language Preferences */}
          <div className="space-y-4">
            <p className="text-white/70 text-sm font-medium">Language Settings</p>

            <LanguageSelector
              label="I speak"
              value={speaksLanguage}
              onChange={setSpeaksLanguage}
              hint="The language you will be speaking"
            />

            <LanguageSelector
              label="I want to hear"
              value={hearsLanguage}
              onChange={setHearsLanguage}
              hint="Translations will be in this language"
            />
          </div>

          {/* Error message */}
          {joinError && (
            <p className="text-red-400 text-sm text-center">{joinError}</p>
          )}

          {/* Join Button */}
          <Button
            fullWidth
            isLoading={isJoining}
            disabled={!displayName.trim()}
            onClick={handleJoin}
          >
            Join Call
          </Button>

          {/* Share Link */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={copyShareLink}
              className="w-full text-center text-white/50 hover:text-white/70 text-sm transition-colors"
            >
              Copy invite link
            </button>
          </div>
        </div>

        {/* Info text */}
        <p className="text-center text-white/40 text-sm mt-6">
          When you speak, your voice will be translated for other participants
        </p>
      </div>
    </div>
  );
}

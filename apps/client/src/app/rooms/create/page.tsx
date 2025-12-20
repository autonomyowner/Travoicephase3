"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LanguageSelector, LanguageCode } from "@/components/ui/LanguageSelector";

export default function CreateRoomPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [roomName, setRoomName] = useState("");
  const [speaksLanguage, setSpeaksLanguage] = useState<LanguageCode>("en");
  const [hearsLanguage, setHearsLanguage] = useState<LanguageCode>("fr");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [createdRoom, setCreatedRoom] = useState<{ code: string; shareUrl: string } | null>(null);

  const handleCreate = async () => {
    if (!roomName.trim()) {
      setError("Room name is required");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create room");
      }

      const room = await res.json();
      setCreatedRoom(room);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
    if (createdRoom) {
      // Store language preferences in sessionStorage for the join page
      sessionStorage.setItem("preferredSpeaksLanguage", speaksLanguage);
      sessionStorage.setItem("preferredHearsLanguage", hearsLanguage);
      router.push(`/rooms/${createdRoom.code}`);
    }
  };

  const copyShareLink = async () => {
    if (createdRoom) {
      await navigator.clipboard.writeText(createdRoom.shareUrl);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="w-12 h-12 border-4 border-white/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Sign in required</h1>
          <p className="text-white/60 mb-6">You need to be signed in to create a room.</p>
          <Button onClick={() => router.push("/sign-in")}>Sign In</Button>
        </div>
      </div>
    );
  }

  // Room created successfully
  if (createdRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(16, 185, 129, 0.2)" }}>
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Room Created</h1>
            <p className="text-white/60">Share the code below to invite others</p>
          </div>

          <div className="rounded-2xl p-6 space-y-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {/* Room Code */}
            <div className="text-center">
              <p className="text-white/60 text-sm mb-2">Room Code</p>
              <p className="text-4xl font-mono font-bold text-emerald-400 tracking-wider">{createdRoom.code}</p>
            </div>

            {/* Share URL */}
            <div>
              <p className="text-white/60 text-sm mb-2">Share Link</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdRoom.shareUrl}
                  className="flex-1 px-4 py-3 rounded-xl text-white/70 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <Button variant="secondary" onClick={copyShareLink}>
                  Copy
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button fullWidth onClick={handleJoinRoom}>
                Join Room
              </Button>
              <Button variant="ghost" fullWidth onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create room form
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create a Room</h1>
          <p className="text-white/60">Set up a translation room for your call</p>
        </div>

        <div className="rounded-2xl p-6 space-y-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {/* Room Name */}
          <Input
            label="Room Name"
            placeholder="e.g., Business Meeting"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            error={error}
          />

          {/* Language Preferences */}
          <div className="space-y-4">
            <p className="text-white/60 text-sm">Your Language Preferences</p>

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
              hint="Translate other languages to this"
            />
          </div>

          {/* Create Button */}
          <Button
            fullWidth
            isLoading={isCreating}
            disabled={!roomName.trim()}
            onClick={handleCreate}
          >
            Create Room
          </Button>
        </div>

        {/* Back link */}
        <p className="text-center mt-6">
          <button
            onClick={() => router.back()}
            className="text-white/40 hover:text-white/60 text-sm transition-colors"
          >
            Back
          </button>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Room {
  id: string;
  code: string;
  name: string;
  shareUrl: string;
  createdAt: string;
  lastActiveAt: string | null;
  activeParticipants: number;
}

interface Call {
  id: string;
  roomCode: string;
  roomName: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  participantCount: number;
  myDisplayName: string;
  mySpokeLanguage: string;
  myHeardLanguage: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");

  // Fetch user's rooms and call history
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const [roomsRes, callsRes] = await Promise.all([
          fetch("/api/rooms"),
          fetch("/api/calls?limit=5"),
        ]);

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(roomsData.rooms || []);
        }

        if (callsRes.ok) {
          const callsData = await callsRes.json();
          setCalls(callsData.calls || []);
        }
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      fetchData();
    }
  }, [user, isLoaded]);

  const handleJoinByCode = () => {
    if (joinCode.trim()) {
      router.push(`/rooms/${joinCode.trim().toUpperCase()}`);
    }
  };

  const copyShareLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="w-12 h-12 border-4 border-white/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">TRAVoices</h1>
          <p className="text-white/60 mb-6">Sign in to access your dashboard</p>
          <Button onClick={() => router.push("/sign-in")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const userName = user.firstName || user.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Hello, {userName}
            </h1>
            <p className="text-white/60">
              Create or join translation rooms for real-time voice translation
            </p>
          </div>
          <Link href="/rooms/create">
            <Button>Create Room</Button>
          </Link>
        </div>

        {/* Quick Join */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Join</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter room code (e.g., ABC123)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinByCode()}
              />
            </div>
            <Button onClick={handleJoinByCode} disabled={!joinCode.trim()}>
              Join
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* My Rooms */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">My Rooms</h2>
              <Link href="/rooms/create" className="text-emerald-400 text-sm hover:underline">
                Create new
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-3 border-white/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/40 mb-4">No rooms yet</p>
                <Link href="/rooms/create">
                  <Button variant="secondary" size="sm">Create your first room</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.slice(0, 5).map((room) => (
                  <div
                    key={room.id}
                    className="p-4 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-medium">{room.name}</h3>
                        <p className="text-emerald-400 text-sm font-mono">{room.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyShareLink(room.shareUrl)}
                          className="px-3 py-1 rounded-lg text-white/60 hover:text-white/80 text-sm"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                          Copy Link
                        </button>
                        <Link href={`/rooms/${room.code}`}>
                          <button
                            className="px-3 py-1 rounded-lg text-emerald-400 hover:text-emerald-300 text-sm"
                            style={{ background: "rgba(16, 185, 129, 0.1)" }}
                          >
                            Join
                          </button>
                        </Link>
                      </div>
                    </div>
                    {room.lastActiveAt && (
                      <p className="text-white/40 text-xs mt-2">
                        Last active: {formatDate(room.lastActiveAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Calls */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Calls</h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-3 border-white/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : calls.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/40">No calls yet</p>
                <p className="text-white/30 text-sm mt-2">Your call history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {calls.map((call) => (
                  <div
                    key={call.id}
                    className="p-4 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-medium">{call.roomName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/40 text-sm">
                            {call.participantCount} participants
                          </span>
                          <span className="text-white/20">|</span>
                          <span className="text-white/40 text-sm">
                            {formatDuration(call.durationSeconds)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                          {call.mySpokeLanguage.toUpperCase()} → {call.myHeardLanguage.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/30 text-xs mt-2">
                      {formatDate(call.startedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-6 rounded-2xl p-6" style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
          <h2 className="text-lg font-semibold text-white mb-4">How it works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(16, 185, 129, 0.2)" }}>
                <span className="text-emerald-400 font-bold">1</span>
              </div>
              <h3 className="text-white font-medium mb-1">Create or Join</h3>
              <p className="text-white/50 text-sm">Create a new room or join with a code</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(16, 185, 129, 0.2)" }}>
                <span className="text-emerald-400 font-bold">2</span>
              </div>
              <h3 className="text-white font-medium mb-1">Set Languages</h3>
              <p className="text-white/50 text-sm">Choose which language you speak and want to hear</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(16, 185, 129, 0.2)" }}>
                <span className="text-emerald-400 font-bold">3</span>
              </div>
              <h3 className="text-white font-medium mb-1">Start Talking</h3>
              <p className="text-white/50 text-sm">Speak naturally - translations happen automatically</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white/30 text-sm">
          <p>Arabic ↔ English real-time voice translation</p>
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AccessToken, RoomServiceClient, AgentDispatchClient } from "livekit-server-sdk";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

interface JoinRoomRequest {
  displayName: string;
  speaksLanguage: "en" | "ar";
  hearsLanguage: "en" | "ar";
  guestId?: string;
}

// POST /api/rooms/[code]/join - Join room with language preferences
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { userId } = await auth();

    const body: JoinRoomRequest = await req.json();
    const { displayName, speaksLanguage, hearsLanguage, guestId } = body;

    // Validate required fields
    if (!displayName || typeof displayName !== "string" || displayName.trim().length === 0) {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 }
      );
    }

    if (!speaksLanguage || !["en", "ar"].includes(speaksLanguage)) {
      return NextResponse.json(
        { error: "Valid speaksLanguage is required (en or ar)" },
        { status: 400 }
      );
    }

    if (!hearsLanguage || !["en", "ar"].includes(hearsLanguage)) {
      return NextResponse.json(
        { error: "Valid hearsLanguage is required (en or ar)" },
        { status: 400 }
      );
    }

    // Find room by code
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        _count: {
          select: {
            participants: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    if (!room.isActive) {
      return NextResponse.json(
        { error: "Room is no longer active" },
        { status: 410 }
      );
    }

    // Check room capacity
    if (room._count.participants >= room.maxParticipants) {
      return NextResponse.json(
        { error: "Room is full" },
        { status: 409 }
      );
    }

    // Determine participant identity
    const isGuest = !userId;
    const odentity = userId || `guest_${guestId || nanoid(10)}`;

    // Check if participant already exists in room
    const existingParticipant = await prisma.roomParticipant.findFirst({
      where: {
        roomId: room.id,
        odentity,
        isActive: true,
      },
    });

    let participant;
    if (existingParticipant) {
      // Update existing participant
      participant = await prisma.roomParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          displayName: displayName.trim(),
          speaksLanguage,
          hearsLanguage,
          joinedAt: new Date(),
          leftAt: null,
        },
      });
    } else {
      // Create new participant
      participant = await prisma.roomParticipant.create({
        data: {
          roomId: room.id,
          odentity,
          displayName: displayName.trim(),
          speaksLanguage,
          hearsLanguage,
          isGuest,
          isActive: true,
        },
      });
    }

    // Update room last active
    await prisma.room.update({
      where: { id: room.id },
      data: { lastActiveAt: new Date() },
    });

    // Generate LiveKit token with metadata
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json(
        { error: "LiveKit credentials not configured" },
        { status: 500 }
      );
    }

    // LiveKit room name = db room code (consistent naming)
    const liveKitRoomName = `room_${room.code}`;

    // Create token with metadata for agent to read language preferences
    const metadata = JSON.stringify({
      participantId: participant.id,
      displayName: displayName.trim(),
      speaksLanguage,
      hearsLanguage,
      roomCode: room.code,
    });

    const token = new AccessToken(apiKey, apiSecret, {
      identity: odentity,
      name: displayName.trim(),
      metadata,
      ttl: "2h",
    });

    token.addGrant({
      roomJoin: true,
      room: liveKitRoomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    // Create room and dispatch agent
    const httpUrl = livekitUrl.replace("wss://", "https://");
    try {
      const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);

      // Create LiveKit room if it doesn't exist
      await roomService.createRoom({
        name: liveKitRoomName,
        emptyTimeout: 300,
        maxParticipants: room.maxParticipants + 1, // +1 for agent
      }).catch(() => {});

      // Dispatch translation agent to room
      const agentDispatch = new AgentDispatchClient(httpUrl, apiKey, apiSecret);
      await agentDispatch.createDispatch(liveKitRoomName, "travoices-translator").catch((err) => {
        console.log("Agent dispatch:", err.message || err);
      });

    } catch (err) {
      console.log("Room/agent setup (non-critical):", err);
    }

    return NextResponse.json({
      token: jwt,
      roomId: room.id,
      roomCode: room.code,
      roomName: room.name,
      participantId: participant.id,
      liveKitRoom: liveKitRoomName,
      odentity,
      isGuest,
    });

  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}

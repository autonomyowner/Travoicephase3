import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, generateUniqueRoomCode } from "@/lib/db";

interface RoomWithCount {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
  lastActiveAt: Date | null;
  _count: {
    participants: number;
  };
}

// POST /api/rooms - Create a new room (auth required)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    // Generate unique room code
    const code = await generateUniqueRoomCode();

    // Create room in database
    const room = await prisma.room.create({
      data: {
        code,
        name: name.trim(),
        creatorId: userId,
        isActive: true,
        maxParticipants: 2,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/rooms/${room.code}`;

    return NextResponse.json({
      id: room.id,
      code: room.code,
      name: room.name,
      shareUrl,
      createdAt: room.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

// GET /api/rooms - List user's rooms (auth required)
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const rooms = await prisma.room.findMany({
      where: {
        creatorId: userId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        code: true,
        name: true,
        createdAt: true,
        lastActiveAt: true,
        _count: {
          select: {
            participants: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json({
      rooms: rooms.map((room: RoomWithCount) => ({
        id: room.id,
        code: room.code,
        name: room.name,
        shareUrl: `${baseUrl}/rooms/${room.code}`,
        createdAt: room.createdAt.toISOString(),
        lastActiveAt: room.lastActiveAt?.toISOString() || null,
        activeParticipants: room._count.participants,
      })),
    });
  } catch (error) {
    console.error("Error listing rooms:", error);
    return NextResponse.json(
      { error: "Failed to list rooms" },
      { status: 500 }
    );
  }
}

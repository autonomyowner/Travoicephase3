import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/rooms/[code] - Get room by code (public, for join page)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
        maxParticipants: true,
        createdAt: true,
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

    return NextResponse.json({
      id: room.id,
      code: room.code,
      name: room.name,
      maxParticipants: room.maxParticipants,
      currentParticipants: room._count.participants,
      createdAt: room.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

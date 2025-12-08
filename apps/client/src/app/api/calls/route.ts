import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

interface UserCallWithRelation {
  id: string;
  odentity: string;
  callId: string;
  displayName: string;
  spokeLanguage: string;
  heardLanguage: string;
  createdAt: Date;
  call: {
    id: string;
    roomCode: string;
    roomName: string;
    startedAt: Date;
    endedAt: Date;
    durationSeconds: number;
    participantCount: number;
  };
}

// GET /api/calls - Get user's call history (auth required)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const userCalls: UserCallWithRelation[] = await prisma.userCallHistory.findMany({
      where: { odentity: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        call: {
          select: {
            id: true,
            roomCode: true,
            roomName: true,
            startedAt: true,
            endedAt: true,
            durationSeconds: true,
            participantCount: true,
          },
        },
      },
    });

    const totalCount = await prisma.userCallHistory.count({
      where: { odentity: userId },
    });

    return NextResponse.json({
      calls: userCalls.map((uc: UserCallWithRelation) => ({
        id: uc.call.id,
        roomCode: uc.call.roomCode,
        roomName: uc.call.roomName,
        startedAt: uc.call.startedAt.toISOString(),
        endedAt: uc.call.endedAt.toISOString(),
        durationSeconds: uc.call.durationSeconds,
        participantCount: uc.call.participantCount,
        myDisplayName: uc.displayName,
        mySpokeLanguage: uc.spokeLanguage,
        myHeardLanguage: uc.heardLanguage,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching call history:", error);
    return NextResponse.json(
      { error: "Failed to fetch call history" },
      { status: 500 }
    );
  }
}

// POST /api/calls - Save call record (called when leaving room)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roomId,
      roomCode,
      roomName,
      startedAt,
      endedAt,
      participants, // Array of { odentity, displayName, spokeLanguage, heardLanguage }
    } = body;

    // Validate required fields
    if (!roomCode || !roomName || !startedAt || !endedAt || !participants) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const startTime = new Date(startedAt);
    const endTime = new Date(endedAt);
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Don't save calls shorter than 10 seconds
    if (durationSeconds < 10) {
      return NextResponse.json({
        message: "Call too short to save",
        saved: false
      });
    }

    // Create call history record
    const callHistory = await prisma.callHistory.create({
      data: {
        roomId: roomId || null,
        roomCode,
        roomName,
        startedAt: startTime,
        endedAt: endTime,
        durationSeconds,
        participantCount: participants.length,
      },
    });

    // Create user call history records for each non-guest participant
    const userCallRecords = participants
      .filter((p: { odentity: string }) => !p.odentity.startsWith("guest_"))
      .map((p: { odentity: string; displayName: string; spokeLanguage: string; heardLanguage: string }) => ({
        odentity: p.odentity,
        callId: callHistory.id,
        displayName: p.displayName,
        spokeLanguage: p.spokeLanguage,
        heardLanguage: p.heardLanguage,
      }));

    if (userCallRecords.length > 0) {
      await prisma.userCallHistory.createMany({
        data: userCallRecords,
      });
    }

    // Mark participants as inactive
    if (roomId) {
      await prisma.roomParticipant.updateMany({
        where: {
          roomId,
          isActive: true,
        },
        data: {
          isActive: false,
          leftAt: endTime,
        },
      });
    }

    return NextResponse.json({
      callId: callHistory.id,
      saved: true,
      durationSeconds,
    });
  } catch (error) {
    console.error("Error saving call history:", error);
    return NextResponse.json(
      { error: "Failed to save call history" },
      { status: 500 }
    );
  }
}

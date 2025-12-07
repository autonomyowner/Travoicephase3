import { AccessToken, RoomServiceClient, AgentDispatchClient } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { roomName, participantName } = await req.json();

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: "roomName and participantName are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json(
        { error: "LiveKit credentials not configured" },
        { status: 500 }
      );
    }

    const httpUrl = livekitUrl.replace("wss://", "https://");

    // Create token for the participant
    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: "1h",
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    // Create room and dispatch agent
    try {
      const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);

      // Create room if it doesn't exist
      await roomService.createRoom({
        name: roomName,
        emptyTimeout: 300,
        maxParticipants: 10,
      }).catch(() => {});

      // Explicitly dispatch agent to the room
      const agentDispatch = new AgentDispatchClient(httpUrl, apiKey, apiSecret);
      await agentDispatch.createDispatch(roomName, "").catch((err) => {
        console.log("Agent dispatch:", err.message || err);
      });

    } catch (err) {
      console.log("Room/agent setup (non-critical):", err);
    }

    return NextResponse.json({ token: jwt });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

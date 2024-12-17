import { authOptions } from "@/app/lib/auth-context";
import {client} from "@/app/lib/Prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpvoteSchema = z.object({
  streamId: z.string(),
  spaceId:z.string()
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 403,
      },
    );
  }
  const user = session.user;

  try {
    const data = UpvoteSchema.parse(await req.json());
    await client.upvote.delete({
      where: {
        userId_streamId:{
            userId: user.id,
            streamId: data.streamId,
        }
      },
    });
    return NextResponse.json({
      message: "Done!",
    });
  } catch (e) {
    return NextResponse.json(
      {
        message: "Error while upvoting", e
      },
      {
        status: 403,
      },
    );
  }
}
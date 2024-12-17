import { NextRequest, NextResponse } from "next/server";
import { UpvoteSchema } from "@/app/schema/type";
import { getServerSession } from "next-auth";
import {client} from '../../lib/Prisma';

export async function POST(req: NextRequest){
    const session = await getServerSession();

    const user = await client.user.findFirst({
        where:{
            email: session?.user?.email ?? ""
        }
    });

    if(!user){
        return NextResponse.json({
            message:"Unauthorized"
        },{
            status:403
        })
    }

    try {
        const parsedData = UpvoteSchema.parse(await req.json());
        await client.votes.create({
            data:{
                UserId: user.id,
                StreamId: parsedData.streamId
            }
        })
    } catch (error) {
        return NextResponse.json({
            message:"Error while upvoting" , error
        },{
            status: 403
        })
    }
}
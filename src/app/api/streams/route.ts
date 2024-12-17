import { NextRequest, NextResponse } from "next/server";
import { StreamSchema } from "@/app/schema/type";
import {client} from '../../lib/Prisma';
import { YT_REGEX } from "@/app/lib/utlis";


export async function POST(req: NextRequest){
    try {
        const parsedData = StreamSchema.parse(await req.json())
        const isYT = YT_REGEX.test(parsedData.url);
        if(!isYT){
            return NextResponse.json({
                message : "URL found"
            },{
                status:411
            }) 
        }

        const exctracted_id = parsedData.url.split("?v")[1];

        const response = await client.streams.create({
            data:{
                UserId: parsedData.creatorId,
                url: parsedData.url,
                exctractedId: exctracted_id,
                type:"Youtube"
            }
        })

    } catch (error) {
        return NextResponse.json({
            message : "Error while adding Stream"
        },{
            status:411
        })
    }
}


export async function GET(req: NextRequest){
    const creatorId = req.nextUrl.searchParams.get("creatorId")
    const streams = await client.streams.findMany({
        where:{
            UserId: creatorId ?? ""
        }
    })

    return NextResponse.json({
        streams
    })
}
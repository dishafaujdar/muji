import { NextRequest, NextResponse } from "next/server";
import { StreamSchema } from "@/app/schema/type";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";
import {client} from '../../lib/Prisma';
import { YT_REGEX } from "@/app/lib/utlis";
import { authOptions } from "@/app/lib/auth-context";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest){
    try {
        const session = await getServerSession(authOptions);

        if(!session?.user.id){
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

        const data = StreamSchema.parse(await req.json());

        if(!data.url.trim()){
            return NextResponse.json(
                {
                  message: "Youtube link cannot be apply",
                },
                {
                  status: 400,
                },
              );
        }

        const isYt = data.url.match(YT_REGEX);
        const videoId = data.url ? isYt?.[1] : null
        if(!isYt  || !videoId){
            return NextResponse.json(
                {
                  message: "Invalid youtube url foramt",
                },
                {
                  status: 400,
                },
              );
        }

        const res = await youtubesearchapi.GetVideoDetails(videoId);

        // Check if the user is not the creator
        if(user.id !== data.creatorId)
        {
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

            const userRecentStreams = await client.stream.count({
                where: {
                  userId: data.creatorId,
                  addedBy: user.id,
                  createAt: {
                    gte: tenMinutesAgo,
                  },
                },
              });

        const duplicateSong = await client.stream.findFirst({
            where: {
              userId: data.creatorId,
              extractedId: videoId,
              createAt: {
                gte: tenMinutesAgo,
              },
            },
          });

        if(duplicateSong){
            return NextResponse.json(
                {
                  message: "This song was already added in the last 10 minutes",
                },
                {
                  status: 429,
                },
            );
        }

        const streamsLastTwoMinutes = await client.stream.count({
            where: {
              userId: data.creatorId,
              addedBy: user.id,
              createAt: {
                gte: twoMinutesAgo,
              },
            },
          });
    
          if (streamsLastTwoMinutes >= 2) {
            return NextResponse.json(
              {
                message:
                  "Rate limit exceeded: You can only add 2 songs per 2 minutes",
              },
              {
                status: 429,
              },
            );
          }

          if (streamsLastTwoMinutes >= 2) {
            return NextResponse.json(
              {
                message:
                  "Rate limit exceeded: You can only add 2 songs per 2 minutes",
              },
              {
                status: 429,
              },
            );
          }
    
          if (userRecentStreams >= 5) {
            return NextResponse.json(
              {
                message:
                  "Rate limit exceeded: You can only add 5 songs per 10 minutes",
              },
              {
                status: 429,
              },
            );
          }
        }

        const thumbnails = res.thumbnail.thumbnails;
        thumbnails.sort((a: { width: number }, b: { width: number }) =>
        a.width < b.width ? -1 : 1 )

        const existingStream = await client.stream.count({
            where:{spaceId : data.spaceId, played: false},
        });

        const MAX_QUEUE_LEN = 20;

        if(existingStream > MAX_QUEUE_LEN){
            return NextResponse.json({
                message:"can't play more than 20 songs"
            },{
                status:429,
            })
        }

        const stream = await client.stream.create({
            data:{
                userId : data.creatorId,
                addedBy: user.id,
                url: data.url,
                extractedId: videoId,
                type: "Youtube",
                title: res.title ?? "Video can't find",
                smallImg: (thumbnails.length > 1
                    ? thumbnails[thumbnails.length - 2].url
                    : thumbnails[thumbnails.length - 1].url) ??
                  "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
                bigImg:
                  thumbnails[thumbnails.length - 1].url ??
                  "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
                spaceId:data.spaceId
              },
        })

        return NextResponse.json({
            ...stream,
            hasUpvotes : false,
            upvotes: 0, 
        })
    } catch (error) {
        return NextResponse.json({
            message : "Error while adding Stream" , error
        },{
            status:411
        })
    }
}

export async function GET(req: NextRequest){
    const spaceId = req.nextUrl.searchParams.get("spaceId");
    const session = await getServerSession(authOptions);

    if(!session?.user.id){
        return NextResponse.json({
            message : "nahi mila user"
        }, {
            status : 404
        })
    }

    const user = session.user;

    if (!spaceId) {
        return NextResponse.json({
            message: "Error"
        }, {
            status: 411
        })
    }

    const [space , activeStream] = await Promise.all([
        client.space.findUnique({
            where:{id: spaceId},
            include: {
                streams: {
                    include: {
                        _count: {
                            select: {
                                upvotes: true
                            }
                        },
                        upvotes: {
                            where: {
                                userId: session?.user.id
                            }
                        }
      
                    },
                    where:{
                        played:false
                    }
                },
                _count: {
                    select: {
                        streams: true
                    }
                },                
            }
        })
    ]);

    client.currentStream.findFirst({
        where:{spaceId: spaceId},
        include:{stream: true}
    })

    const hostId =space?.hostId;
    const isCreator = session.user.id=== hostId

    return NextResponse.json({
        streams: space?.streams.map(({_count, ...rest}) => ({
            ...rest,
            upvotes: _count.upvotes,
            haveUpvoted: rest.upvotes.length ? true : false
        })),
        activeStream,
        hostId,
        isCreator,
        spaceName:space?.name
    });
}
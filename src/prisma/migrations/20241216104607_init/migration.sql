-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'User');

-- CreateEnum
CREATE TYPE "Providers" AS ENUM ('Google');

-- CreateEnum
CREATE TYPE "StreamType" AS ENUM ('Youtube', 'Spotify');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "provider" "Providers" NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Streams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "UserId" TEXT NOT NULL,
    "type" "StreamType" NOT NULL,
    "url" TEXT NOT NULL,
    "exctractedId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "played" BOOLEAN NOT NULL DEFAULT false,
    "playedTs" TIMESTAMP(3),
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT NOT NULL,
    "spaceId" TEXT,

    CONSTRAINT "Streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrentStream" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streamId" TEXT,
    "spaceId" TEXT,

    CONSTRAINT "CurrentStream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Votes" (
    "id" TEXT NOT NULL,
    "UserId" TEXT NOT NULL,
    "StreamId" TEXT NOT NULL,

    CONSTRAINT "Votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_streamId_key" ON "CurrentStream"("streamId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_spaceId_key" ON "CurrentStream"("spaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Votes_StreamId_UserId_key" ON "Votes"("StreamId", "UserId");

-- AddForeignKey
ALTER TABLE "Streams" ADD CONSTRAINT "Streams_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Streams" ADD CONSTRAINT "Streams_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Streams" ADD CONSTRAINT "Streams_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Streams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_StreamId_fkey" FOREIGN KEY ("StreamId") REFERENCES "Streams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

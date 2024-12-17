/*
  Warnings:

  - You are about to drop the column `addedBy` on the `Streams` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Streams" DROP CONSTRAINT "Streams_addedBy_fkey";

-- AlterTable
ALTER TABLE "Streams" DROP COLUMN "addedBy";

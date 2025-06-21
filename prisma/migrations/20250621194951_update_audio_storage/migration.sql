/*
  Warnings:

  - You are about to drop the column `audioBlobData` on the `code_walkthrough` table. All the data in the column will be lost.
  - You are about to drop the column `audioBlobType` on the `code_walkthrough` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "code_walkthrough" DROP COLUMN "audioBlobData",
DROP COLUMN "audioBlobType",
ADD COLUMN     "audioContentType" TEXT,
ADD COLUMN     "audioFileKey" TEXT;

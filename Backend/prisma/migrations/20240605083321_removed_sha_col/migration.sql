/*
  Warnings:

  - You are about to drop the column `sha` on the `ReviewComment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[commentId]` on the table `ReviewComment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ReviewComment_sha_key";

-- AlterTable
ALTER TABLE "ReviewComment" DROP COLUMN "sha";

-- CreateIndex
CREATE UNIQUE INDEX "ReviewComment_commentId_key" ON "ReviewComment"("commentId");

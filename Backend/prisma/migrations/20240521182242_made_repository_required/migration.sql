/*
  Warnings:

  - Made the column `repositoryId` on table `commits` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "commits" DROP CONSTRAINT "commits_repositoryId_fkey";

-- AlterTable
ALTER TABLE "commits" ALTER COLUMN "repositoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "commits" ADD CONSTRAINT "commits_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

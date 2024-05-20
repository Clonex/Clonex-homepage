-- AlterTable
ALTER TABLE "commits" ALTER COLUMN "pushId" SET DATA TYPE BIGINT;

-- CreateIndex
CREATE INDEX "commits_pushId_idx" ON "commits"("pushId");

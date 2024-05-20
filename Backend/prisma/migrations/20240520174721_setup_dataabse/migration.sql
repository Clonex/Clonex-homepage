-- CreateTable
CREATE TABLE "commits" (
    "id" SERIAL NOT NULL,
    "pushId" INTEGER NOT NULL,
    "ref" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sha" TEXT NOT NULL,

    CONSTRAINT "commits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitChange" (
    "id" SERIAL NOT NULL,
    "commitId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "extension" TEXT,
    "additions" INTEGER NOT NULL,
    "deletions" INTEGER NOT NULL,

    CONSTRAINT "CommitChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commits_sha_key" ON "commits"("sha");

-- AddForeignKey
ALTER TABLE "CommitChange" ADD CONSTRAINT "CommitChange_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "commits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

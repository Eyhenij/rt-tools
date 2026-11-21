-- CreateTable
CREATE TABLE "epic_window" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "epic" INTEGER NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "calls" INTEGER NOT NULL,
    "refusals" INTEGER NOT NULL,
    "reasks" INTEGER NOT NULL,
    "merged" BOOLEAN NOT NULL,
    "released" BOOLEAN NOT NULL,
    "mergedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "minutes" INTEGER,
    "stamp" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "epic_window_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "epic_window_openedAt_idx" ON "epic_window"("openedAt");

-- CreateIndex
CREATE UNIQUE INDEX "epic_window_treeId_origin_epic_openedAt_key" ON "epic_window"("treeId", "origin", "epic", "openedAt");

-- AddForeignKey
ALTER TABLE "epic_window" ADD CONSTRAINT "epic_window_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "tree"("id") ON DELETE CASCADE ON UPDATE CASCADE;


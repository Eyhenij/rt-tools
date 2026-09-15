-- CreateTable
CREATE TABLE "observation" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "t" TIMESTAMP(3) NOT NULL,
    "ev" TEXT NOT NULL,
    "res" TEXT NOT NULL,
    "kind" TEXT,
    "skill" TEXT,
    "sid" TEXT NOT NULL,
    "v" TEXT NOT NULL,

    CONSTRAINT "observation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "observation_treeId_day_idx" ON "observation"("treeId", "day");

-- CreateIndex
CREATE INDEX "observation_treeId_origin_day_idx" ON "observation"("treeId", "origin", "day");

-- AddForeignKey
ALTER TABLE "observation" ADD CONSTRAINT "observation_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "tree"("id") ON DELETE CASCADE ON UPDATE CASCADE;


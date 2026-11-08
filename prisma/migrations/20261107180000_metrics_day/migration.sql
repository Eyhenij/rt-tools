-- CreateTable
CREATE TABLE "metrics_day" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "stamp" TIMESTAMP(3) NOT NULL,
    "metrics" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metrics_day_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "metrics_day_day_idx" ON "metrics_day"("day");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_day_treeId_origin_day_key" ON "metrics_day"("treeId", "origin", "day");

-- AddForeignKey
ALTER TABLE "metrics_day" ADD CONSTRAINT "metrics_day_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "tree"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- AlterTable
ALTER TABLE "postmortem" ADD COLUMN     "resource" TEXT;

-- CreateTable
CREATE TABLE "record_transition" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "state" "CargoState" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "record_transition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "record_transition_recordId_idx" ON "record_transition"("recordId");


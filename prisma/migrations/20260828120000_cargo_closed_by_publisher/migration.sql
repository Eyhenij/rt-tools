-- AlterTable
ALTER TABLE "postmortem" ADD COLUMN "closedByPublisher" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "proposal" ADD COLUMN "closedByPublisher" BOOLEAN NOT NULL DEFAULT false;

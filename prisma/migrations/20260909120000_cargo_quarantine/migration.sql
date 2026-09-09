-- AlterEnum
ALTER TYPE "CargoState" ADD VALUE 'quarantined';

-- AlterTable
ALTER TABLE "postmortem" ADD COLUMN "quarantineNote" TEXT;

-- AlterTable
ALTER TABLE "proposal" ADD COLUMN "quarantineNote" TEXT;

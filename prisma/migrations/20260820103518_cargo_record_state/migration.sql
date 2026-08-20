-- CreateEnum
CREATE TYPE "CargoState" AS ENUM ('new', 'in_work', 'fixed', 'released');

-- AlterTable
ALTER TABLE "postmortem" ADD COLUMN     "state" "CargoState" NOT NULL DEFAULT 'new';

-- AlterTable
ALTER TABLE "proposal" ADD COLUMN     "state" "CargoState" NOT NULL DEFAULT 'new';


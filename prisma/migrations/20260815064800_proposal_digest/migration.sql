-- Признак предложения и дерево при нём.
--
-- Уникальность переезжает с пары «запись месяца — текст» на пару «дерево — признак»: повтор
-- приезжает в любом месяце, и граница месяца от него не защищает. Признак — хеш текста: по
-- полю в килобайты уникальность упирается в предел размера строки индекса.

-- AlterTable
ALTER TABLE "proposal" ADD COLUMN "treeId" TEXT;
ALTER TABLE "proposal" ADD COLUMN "digest" TEXT;

-- Дерево берётся у записи месяца, признак считается от текста тем же хешем, что и в коде.
UPDATE "proposal" AS p
SET "treeId" = m."treeId",
    "digest" = encode(sha256(p."text"::bytea), 'hex')
FROM "month_record" AS m
WHERE m."id" = p."recordId";

-- Накопленные повторы мешают ограничению: остаётся тот, что приехал первым.
DELETE FROM "proposal" AS p
USING "proposal" AS q
WHERE p."treeId" = q."treeId"
  AND p."digest" = q."digest"
  AND (p."arrivedAt", p."id") > (q."arrivedAt", q."id");

ALTER TABLE "proposal" ALTER COLUMN "treeId" SET NOT NULL;
ALTER TABLE "proposal" ALTER COLUMN "digest" SET NOT NULL;

-- DropIndex
DROP INDEX "proposal_recordId_text_key";

-- CreateIndex
CREATE INDEX "proposal_treeId_idx" ON "proposal"("treeId");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_treeId_digest_key" ON "proposal"("treeId", "digest");

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "tree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

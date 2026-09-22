-- CreateEnum
CREATE TYPE "ChatConversationState" AS ENUM ('live', 'closed');

-- DropIndex
DROP INDEX "chat_conversation_siteId_lastMessageAt_idx";

-- AlterTable
ALTER TABLE "chat_conversation" ADD COLUMN     "state" "ChatConversationState" NOT NULL DEFAULT 'live';

-- CreateTable
CREATE TABLE "chat_operator" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_operator_site" (
    "operatorId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_operator_site_pkey" PRIMARY KEY ("operatorId","siteId")
);

-- CreateIndex
CREATE INDEX "chat_operator_accountId_idx" ON "chat_operator"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_operator_spaceId_accountId_key" ON "chat_operator"("spaceId", "accountId");

-- CreateIndex
CREATE INDEX "chat_operator_site_siteId_idx" ON "chat_operator_site"("siteId");

-- CreateIndex
CREATE INDEX "chat_conversation_siteId_state_lastMessageAt_idx" ON "chat_conversation"("siteId", "state", "lastMessageAt");

-- AddForeignKey
ALTER TABLE "chat_operator" ADD CONSTRAINT "chat_operator_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "chat_space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_operator_site" ADD CONSTRAINT "chat_operator_site_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "chat_operator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_operator_site" ADD CONSTRAINT "chat_operator_site_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "chat_site"("id") ON DELETE CASCADE ON UPDATE CASCADE;


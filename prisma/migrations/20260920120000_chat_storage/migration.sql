-- CreateEnum
CREATE TYPE "ChatSide" AS ENUM ('visitor', 'operator');

-- CreateTable
CREATE TABLE "chat_space" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_site" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "origins" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_visitor" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_conversation" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "side" "ChatSide" NOT NULL,
    "text" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_space_name_key" ON "chat_space"("name");

-- CreateIndex
CREATE UNIQUE INDEX "chat_site_key_key" ON "chat_site"("key");

-- CreateIndex
CREATE INDEX "chat_site_spaceId_idx" ON "chat_site"("spaceId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_visitor_siteId_token_key" ON "chat_visitor"("siteId", "token");

-- CreateIndex
CREATE UNIQUE INDEX "chat_conversation_visitorId_key" ON "chat_conversation"("visitorId");

-- CreateIndex
CREATE INDEX "chat_conversation_siteId_lastMessageAt_idx" ON "chat_conversation"("siteId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "chat_message_conversationId_takenAt_idx" ON "chat_message"("conversationId", "takenAt");

-- AddForeignKey
ALTER TABLE "chat_site" ADD CONSTRAINT "chat_site_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "chat_space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_visitor" ADD CONSTRAINT "chat_visitor_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "chat_site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversation" ADD CONSTRAINT "chat_conversation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "chat_site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversation" ADD CONSTRAINT "chat_conversation_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "chat_visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "chat_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;


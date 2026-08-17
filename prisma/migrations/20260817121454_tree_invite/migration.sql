-- CreateTable
CREATE TABLE "tree_invite" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "activeName" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "redeemedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "treeId" TEXT,

    CONSTRAINT "tree_invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tree_invite_hash_key" ON "tree_invite"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "tree_invite_activeName_key" ON "tree_invite"("activeName");

-- CreateIndex
CREATE INDEX "tree_invite_treeId_idx" ON "tree_invite"("treeId");

-- AddForeignKey
ALTER TABLE "tree_invite" ADD CONSTRAINT "tree_invite_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "tree"("id") ON DELETE SET NULL ON UPDATE CASCADE;


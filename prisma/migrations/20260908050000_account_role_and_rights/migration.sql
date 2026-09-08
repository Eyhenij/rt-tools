-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rights" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_permission" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "right" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,

    CONSTRAINT "account_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_key_key" ON "role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE INDEX "account_permission_accountId_idx" ON "account_permission"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "account_permission_accountId_right_key" ON "account_permission"("accountId", "right");

-- AlterTable
ALTER TABLE "account" ADD COLUMN "roleId" TEXT;

-- CreateIndex
CREATE INDEX "account_roleId_idx" ON "account"("roleId");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_permission" ADD CONSTRAINT "account_permission_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "tree" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tree_token" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "tree_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "month_record" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "schema" TEXT NOT NULL,
    "ranAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "month_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "arrivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postmortem" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "arrivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postmortem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tree_slug_key" ON "tree"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tree_name_key" ON "tree"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tree_token_hash_key" ON "tree_token"("hash");

-- CreateIndex
CREATE INDEX "tree_token_treeId_idx" ON "tree_token"("treeId");

-- CreateIndex
CREATE UNIQUE INDEX "month_record_treeId_month_key" ON "month_record"("treeId", "month");

-- CreateIndex
CREATE INDEX "proposal_recordId_idx" ON "proposal"("recordId");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_recordId_text_key" ON "proposal"("recordId", "text");

-- CreateIndex
CREATE INDEX "postmortem_treeId_idx" ON "postmortem"("treeId");

-- CreateIndex
CREATE UNIQUE INDEX "postmortem_treeId_file_key" ON "postmortem"("treeId", "file");

-- AddForeignKey
ALTER TABLE "tree_token" ADD CONSTRAINT "tree_token_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "tree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "month_record" ADD CONSTRAINT "month_record_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "tree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "month_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postmortem" ADD CONSTRAINT "postmortem_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "tree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

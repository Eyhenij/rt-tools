-- Запись вызова наружу: что ушло, когда и чем кончилось.
--
-- Успех отправки ещё не значит, что приложение вызов приняло: без записи вызов, который не ушёл
-- вовсе, и вызов, отбитый принимающей стороной, выглядят одинаково.
DO $$
BEGIN
    CREATE TYPE "ChatHookKind" AS ENUM ('remark', 'closing', 'unanswered');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "chat_hook_call" (
    "id"             TEXT NOT NULL,
    "siteId"         TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "kind"           "ChatHookKind" NOT NULL,
    "body"           TEXT NOT NULL,
    "attempts"       INTEGER NOT NULL DEFAULT 0,
    "lastStatus"     INTEGER,
    "lastFault"      TEXT NOT NULL DEFAULT '',
    "deliveredAt"    TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_hook_call_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "chat_hook_call_siteId_createdAt_idx" ON "chat_hook_call" ("siteId", "createdAt");

-- Вызовы принадлежат площадке и уходят вместе с ней: без площадки они говорят о разговоре,
-- которого больше нет.
DO $$
BEGIN
    ALTER TABLE "chat_hook_call"
        ADD CONSTRAINT "chat_hook_call_siteId_fkey"
        FOREIGN KEY ("siteId") REFERENCES "chat_site" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- У посетителя несколько переписок на сайте, и ответ помнит имя учётной записи, которая его написала.
--
-- Уникальность переписки по посетителю снимается: новое обращение посетитель заводит сам, кнопкой
-- виджета. Вместо неё — указатель для списка обращений посетителя, свежие первыми.
DROP INDEX IF EXISTS "chat_conversation_visitorId_key";

CREATE INDEX IF NOT EXISTS "chat_conversation_visitorId_lastMessageAt_idx" ON "chat_conversation"("visitorId", "lastMessageAt");

-- Имя учётной записи на минуту ответа. Пусто — ответ без учётной записи: со встраиваемой страницы
-- или написанный до этого поля.
ALTER TABLE "chat_message" ADD COLUMN IF NOT EXISTS "authorName" TEXT NOT NULL DEFAULT '';

-- Приветствие площадки и часы ответа.
--
-- Виджет посетителя показывает их до первой реплики: приветствие словами площадки и час, с
-- которого отвечает оператор. Оба лежат на записи площадки, а не в скрипте страницы: слово,
-- написанное на странице потребителя, разошлось бы с тем, что видит оператор, и поправить его
-- пришлось бы выкаткой чужого приложения.
--
-- Умолчания выбраны так, чтобы уже заведённые площадки не меняли поведения: приветствия нет,
-- часы не названы — виджет о них молчит.
ALTER TABLE "chat_site" ADD COLUMN IF NOT EXISTS "greeting" TEXT NOT NULL DEFAULT '';
ALTER TABLE "chat_site" ADD COLUMN IF NOT EXISTS "answerFrom" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "chat_site" ADD COLUMN IF NOT EXISTS "answerTo" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "chat_site" ADD COLUMN IF NOT EXISTS "timeZone" TEXT NOT NULL DEFAULT '';

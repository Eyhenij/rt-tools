-- Адрес вызова наружу, тайна подписи и условленное время без ответа.
--
-- Сервис сам человека не будит: ни почты, ни мессенджера у него нет. Он зовёт приложение
-- площадки, а чем поднять оператора, решает оно — почта операторов и свои экраны у него уже есть.
--
-- Умолчания выбраны так, чтобы уже заведённые площадки не меняли поведения: адреса нет — вызовы
-- наружу не уходят вовсе; ноль минут — будильник о неотвеченной переписке выключен.
ALTER TABLE "chat_site" ADD COLUMN IF NOT EXISTS "hookUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "chat_site" ADD COLUMN IF NOT EXISTS "hookSecret" TEXT NOT NULL DEFAULT '';
ALTER TABLE "chat_site" ADD COLUMN IF NOT EXISTS "answerWithin" INTEGER NOT NULL DEFAULT 0;

-- Минута последнего будильника по переписке. Пусто — переписка не будила никого ни разу; ответ
-- оператора её снимает, и следующая реплика посетителя начинает отсчёт заново.
ALTER TABLE "chat_conversation" ADD COLUMN IF NOT EXISTS "wokeAt" TIMESTAMP(3);

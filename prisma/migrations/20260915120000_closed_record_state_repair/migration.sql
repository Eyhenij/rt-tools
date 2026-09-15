-- Состояние записям, закрытым издателем и вернувшимся в «новое».
--
-- Закрытие издателем ставило состояние и признак closedByPublisher, а повторный приезд разбора с
-- другим текстом возвращал состояние в «новое» и признака не знал. Так у 62 записей одного дерева
-- сложилась пара «новое, закрыто издателем», которой нет на карте состояний. Правило приезда
-- закрытую запись больше не трогает; здесь восстанавливаются те, что уже разошлись: версия
-- выпуска у записи лежит — «выпущено», нет — «починено». Обе таблицы: признак один на оба рода.
UPDATE "postmortem"
SET "state" = CASE WHEN "releaseVersion" IS NOT NULL THEN 'released'::"CargoState" ELSE 'fixed'::"CargoState" END
WHERE "closedByPublisher" = true AND "state" = 'new'::"CargoState";

UPDATE "proposal"
SET "state" = CASE WHEN "releaseVersion" IS NOT NULL THEN 'released'::"CargoState" ELSE 'fixed'::"CargoState" END
WHERE "closedByPublisher" = true AND "state" = 'new'::"CargoState";

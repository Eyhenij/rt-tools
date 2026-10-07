-- Люди, роли и входы уходят из приёмника: их держит Keycloak, а приёмник проверяет его токен.
-- Строки этих таблиц не переносятся сюда же: выгрузка людей в Keycloak читает их до выкатки.
DROP TABLE IF EXISTS "session";
DROP TABLE IF EXISTS "account_permission";
DROP TABLE IF EXISTS "account";
DROP TABLE IF EXISTS "role";

-- Оператор чата называет человека ключом Keycloak. Значения колонки переписывает перенос людей:
-- до него в проде в ней лежат ключи прежних записей приёмника.
ALTER TABLE "chat_operator" RENAME COLUMN "accountId" TO "personId";
ALTER INDEX "chat_operator_accountId_idx" RENAME TO "chat_operator_personId_idx";
ALTER INDEX "chat_operator_spaceId_accountId_key" RENAME TO "chat_operator_spaceId_personId_key";

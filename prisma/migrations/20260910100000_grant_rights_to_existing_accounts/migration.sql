-- Права существующим записям.
--
-- Миграция 20260908050000_account_role_and_rights завела роли и точечные права и закрыла ими все
-- операции приёмника. Прав она не выдала никому: у всех записей, заведённых до неё, роль пустая, а
-- пустая роль означает «ни одного права». Приёмник после неё отвечал 403 на любое чтение — и
-- человеку, и служебной записи разбора груза.
--
-- Здесь заводятся две роли и назначаются записям, которые существовали до закрытия: это возвращает
-- то состояние, что было до миграции прав, а не выдаёт что-то новое.
--
-- Идемпотентна: повторный прогон ничего не меняет. Роли заводятся по ключу, назначение ставится
-- только там, где роли ещё нет, — снятую вручную роль миграция не возвращает.

-- Роль владельца: весь набор прав. Он закрыт кодом, и здесь перечислен тот же набор.
INSERT INTO "role" ("id", "key", "name", "rights")
VALUES (
    gen_random_uuid(),
    'owner',
    'Владелец',
    ARRAY[
        'postmortems:read',
        'postmortems:manage',
        'proposals:read',
        'proposals:manage',
        'summaries:read',
        'invites:read',
        'invites:manage',
        'accounts:read',
        'accounts:manage',
        'roles:manage'
    ]
)
ON CONFLICT ("key") DO NOTHING;

-- Роль разбора груза: чтение и пометка груза, и ничего больше. Учётные записи людей приёмник этой
-- ролью не заводит и не правит.
INSERT INTO "role" ("id", "key", "name", "rights")
VALUES (
    gen_random_uuid(),
    'cargo-triage',
    'Разбор груза',
    ARRAY[
        'postmortems:read',
        'postmortems:manage',
        'proposals:read',
        'proposals:manage',
        'summaries:read'
    ]
)
ON CONFLICT ("key") DO NOTHING;

-- Служебная запись разбора груза узнаётся по приведённому имени: уникальность хранилище держит по
-- нему, а не по показываемому имени, и вход ищет запись тоже по нему.
UPDATE "account"
SET "roleId" = (SELECT "id" FROM "role" WHERE "key" = 'cargo-triage')
WHERE "nameKey" = 'cargo-triage'
  AND "roleId" IS NULL;

-- Остальные записи, заведённые до закрытия операций правами, получают роль владельца: до неё они
-- видели приёмник целиком, и работа встала именно на этом.
UPDATE "account"
SET "roleId" = (SELECT "id" FROM "role" WHERE "key" = 'owner')
WHERE "roleId" IS NULL
  AND "nameKey" <> 'cargo-triage'
  AND "createdAt" < TIMESTAMP '2026-09-08 05:00:00';

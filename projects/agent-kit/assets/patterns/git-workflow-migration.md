---
name: git-workflow-migration
kind: pattern
rule: git-workflow
description: Паттерн правила git-workflow. Брать при правке prisma/schema.prisma и prisma/migrations/** — готовые команды одноразового контейнера, написание файла миграции через migrate diff, накат локальной базы. Не брать для коммита и PR — это паттерн git-workflow-commit.
---

# Миграция и прогон цепочки

Паттерн правила `git-workflow`. Что при этом должно быть верно — закон
`docs/constitution/delivery.md`.

## Когда брать

- Правится `prisma/schema.prisma`.
- Заводится или переименовывается каталог в `prisma/migrations/`.
- Ветка с новой миграцией готовится к мержу.

## Цепочка гоняется одной командой

Локальные `lint`, `test`, `check:all` и сборки порядок миграций не трогают вовсе, а шаг
`Migrations match schema` в `.github/workflows/deploy.yml` идёт уже после мержа. Проверка
стоит гейтом пуша и зовётся руками:

```bash
npm run check:schema
```

Она накатывает цепочку на теневую базу — ту же, что рабочая, с суффиксом `_gate_shadow`, —
сравнивает её со схемой и сносит. Своя база при этом не трогается: сверка с ней судила бы о
состоянии машины, а не репозитория. Погашенный докер и боевой адрес проверка пропускает
молча.

Когда базы под рукой нет вовсе, та же цепочка гоняется на одноразовом контейнере:

```bash
docker run -d --rm --name <префикс>-migcheck -e POSTGRES_PASSWORD=migcheck -p 55432:5432 postgres:16-alpine
docker exec <префикс>-migcheck pg_isready -U postgres          # накат до готовности падает на соединении
DATABASE_URL=postgresql://postgres:migcheck@localhost:55432/postgres npx prisma migrate deploy
DATABASE_URL=postgresql://postgres:migcheck@localhost:55432/postgres npx prisma migrate diff \
    --from-config-datasource --to-schema prisma/schema.prisma --exit-code
docker stop <префикс>-migcheck
```

Адрес ставится префиксом самой команды — `export` между вызовами не живёт.

## Файл миграции пишется тем же контейнером

`prisma migrate dev` не запускается ни командой, ни через `npm run prisma:migrate`: любое
расхождение состояния он лечит предложением сбросить базу, а в локальной базе лежат объекты и
брони владельца. Файл берётся разницей между накатанной цепочкой и схемой:

```bash
DATABASE_URL=postgresql://postgres:migcheck@localhost:55432/postgres npx prisma migrate diff \
    --from-config-datasource --to-schema prisma/schema.prisma --script \
    > prisma/migrations/<метка>_<имя>/migration.sql
```

Каталог заводится **после** наката цепочки: пустой каталог, попавший в `migrate deploy`,
помечается применённым, и его содержимое на этот контейнер уже не встанет.

## Локальная база догоняет ветку

```bash
npx prisma migrate deploy
```

Переименованная миграция остаётся в ней под прежним именем, и накат падает на
`relation … already exists`. Состояние правится, повторный накат его не чинит:

```bash
npx prisma migrate resolve --applied <новое имя>
```

## Частые промахи

- Метку времени ставит момент создания, а порядок применения лексикографический: миграция из
  ветки, начатой раньше, встаёт перед той, от которой зависит. На существующей базе это
  незаметно — падает только накат с нуля.
- Флаги `prisma migrate diff` не те, что в примерах из сети: `--from-url`, `--to-url`,
  `--shadow-database-url` и `--to-schema-datamodel` сняты, а `prisma db execute` адреса
  базы не принимает вовсе и берёт его из `prisma.config.ts`. На неизвестный флаг обе команды
  печатают справку, и промах виден только в ней. Какие флаги есть сейчас, смотрят в
  `prisma migrate diff --help`, а не в этом тексте.
- Запись в боевую базу (порт 15432, прод-хост) запрещена совсем: схема меняется миграцией
  через деплой, данные — через админку.
- Строки адресуются по первичному ключу, а не по маске: удаление по маске почты однажды унесло
  вместе с тестовыми записями демонстрационные брони владельца.

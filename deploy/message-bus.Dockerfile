# Образ приёмника. Собирается из корня дерева: docker build -f deploy/message-bus.Dockerfile .
#
# `--platform=$BUILDPLATFORM` — стадия сборки считается на архитектуре сборщика, а не образа:
# вывод `nx build` от архитектуры не зависит, а нативные модули ставит вторая стадия сама.
# Скопировать сюда `node_modules` первой стадии — значит собрать образ, который молча не
# поднимется на узле другой архитектуры.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
RUN corepack enable
WORKDIR /workspace

# Сначала манифесты: слой установки переживает правку исходников и берётся из кэша, пока не
# изменился снимок дерева зависимостей. Схема хранилища едет вместе с ними, а не ниже: установка
# зависимостей заканчивается генерацией клиента хранилища, и без схемы она отказывает — то есть
# образ не собирается вовсе, ещё не дойдя до своего кода.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
# Пакеты входа приёмник берёт исходниками, а их зависимости объявлены только в их манифестах:
# без манифестов установка не ставит `jose`, и сборка пакетов падает на нём.
COPY projects/auth-contract/package.json ./projects/auth-contract/package.json
COPY projects/auth-server/package.json ./projects/auth-server/package.json
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Конфиг линтера читает tools/lint-rules и каталог границ, а плагин Nx строит по нему граф
# проектов: без этих каталогов сборка падает на построении графа, а не на самом коде.
# Настройка Prisma идёт здесь, а не рядом с манифестами: она нужна накату на второй стадии, а
# слой установки зависимостей ею не пользуется — поставленный выше, этот файл ронял бы кэш
# установки при каждой своей правке.
COPY nx.json tsconfig.base.json eslint.config.mjs prisma.config.ts ./
COPY eslint ./eslint
COPY tools ./tools
COPY apps/message-bus ./apps/message-bus
COPY libs ./libs
# Форма груза объявлена в пакете правил, и серверная сторона зовёт её алиасом
# `@rt-tools/agent-kit/cargo`. Алиас ведёт в исходник пакета, а не в собранный артефакт, поэтому
# каталог нужен здесь целиком: без него сборка падает на пяти файлах приёма, а не на своём коде.
COPY projects/agent-kit ./projects/agent-kit
# Проверка токена входа и права операций — пакеты `@rt-tools/auth-server` и
# `@rt-tools/auth-contract`, их алиасы тоже ведут в исходники.
COPY projects/auth-contract ./projects/auth-contract
COPY projects/auth-server ./projects/auth-server
RUN npx prisma generate --schema prisma/schema.prisma
RUN NX_DAEMON=false npx nx build message-bus
# Перехватчик прав Connect из `@rt-tools/auth-server` берёт `@connectrpc/connect`, а пакет объявляет
# его однорангово: собранный манифест такие не называет, и приёмник падал на первом `require`.
# Версия берётся из корневого манифеста, своей копии здесь нет; не нашлась — сборка падает здесь.
RUN node -e "const fs = require('fs'); const out = 'dist/apps/message-bus/package.json'; \
    const root = require('./package.json'); const name = '@connectrpc/connect'; \
    const version = (root.dependencies || {})[name] || (root.devDependencies || {})[name]; \
    if (!version) { console.error(name + ': no version in the root package.json'); process.exit(1); } \
    const pkg = JSON.parse(fs.readFileSync(out, 'utf8')); pkg.dependencies[name] = version; \
    fs.writeFileSync(out, JSON.stringify(pkg, null, 2))"

FROM node:22-alpine
WORKDIR /app
# Образ поднимают и мимо состава прода — ручным прогоном, отладкой на узле. Пустое значение
# приложение читает как местную машину и разрешает себе отладочные умолчания.
ENV NODE_ENV=production
COPY --from=build /workspace/dist/apps/message-bus ./
# Схема и миграции нужны накату (`prisma migrate deploy`); сам приёмник их не читает.
COPY --from=build /workspace/prisma ./prisma
# Адрес хранилища седьмая редакция Prisma принимает только из настройки, а не из схемы и не из
# одного лишь окружения: без этого файла накат отказывает строкой про обязательное свойство
# `datasource.url` — при заданном `DATABASE_URL`. Приёмник настройку не читает вовсе, она нужна
# только накату.
COPY --from=build /workspace/prisma.config.ts ./prisma.config.ts
# Установка идёт под архитектурой образа: здесь ставятся нативные модули, и сделать это на
# стадии сборки нельзя.
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm install --omit=dev --no-audit --no-fund \
    && npm install --no-audit --no-fund --no-save prisma@7.9.1
EXPOSE 3000
CMD ["node", "main.js"]

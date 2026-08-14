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
# изменился снимок дерева зависимостей.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Конфиг линтера читает tools/lint-rules, а плагин Nx строит по нему граф проектов: без этих
# каталогов сборка падает на построении графа, а не на самом коде.
COPY nx.json tsconfig.base.json eslint.config.cjs ./
COPY tools ./tools
COPY prisma ./prisma
COPY apps/message-bus ./apps/message-bus
COPY libs ./libs
RUN npx prisma generate --schema prisma/schema.prisma
RUN NX_DAEMON=false npx nx build message-bus

FROM node:22-alpine
WORKDIR /app
# Образ поднимают и мимо состава прода — ручным прогоном, отладкой на узле. Пустое значение
# приложение читает как местную машину и разрешает себе отладочные умолчания.
ENV NODE_ENV=production
COPY --from=build /workspace/dist/apps/message-bus ./
# Схема и миграции нужны накату (`prisma migrate deploy`); сам приёмник их не читает.
COPY --from=build /workspace/prisma ./prisma
# Установка идёт под архитектурой образа: здесь ставятся нативные модули, и сделать это на
# стадии сборки нельзя.
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm install --omit=dev --no-audit --no-fund \
    && npm install --no-audit --no-fund --no-save prisma@7.9.1
EXPOSE 3000
CMD ["node", "main.js"]

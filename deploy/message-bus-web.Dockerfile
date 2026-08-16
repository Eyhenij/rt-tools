# Образ дороги: проксировщик со статикой админки внутри.
#
# Собирается из корня дерева: docker build -f deploy/message-bus-web.Dockerfile .
#
# Своего процесса у админки нет — она статика, и второй контейнер ради отдачи файлов на узле с
# 961 МБ памяти не заводится. Отдаёт её тот же проксировщик, который держит имя и сертификат:
# вход человека живёт кукой своего адреса, и админка, отданная с другого имени, приезжала бы к
# приёмнику без входа.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
RUN corepack enable
WORKDIR /workspace

# Порядок тот же, что у образа приёмника, и по той же причине: слой установки переживает правку
# исходников, пока не изменился снимок дерева зависимостей. Схема хранилища едет вместе с
# манифестами — установка заканчивается генерацией клиента хранилища и без схемы отказывает.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Конфиг линтера читает tools/lint-rules и каталог границ, а плагин Nx строит по нему граф
# проектов: без этих каталогов сборка падает на построении графа, а не на самом коде.
COPY nx.json tsconfig.base.json eslint.config.mjs ./
COPY eslint ./eslint
COPY tools ./tools
COPY apps/message-bus-admin ./apps/message-bus-admin
COPY libs ./libs
# Админка стоит на ките этого же дерева, и берётся он исходниками, а не выпущенным пакетом:
# выпуск — решение владельца, и ждать его ради выкатки нечего.
COPY projects ./projects
RUN NX_DAEMON=false npx nx build message-bus-admin

FROM caddy:2-alpine
# Сборка кладётся туда, куда смотрит `root` конфига. Конфиг копируется в образ, а не
# монтируется с узла: смонтированный файл живёт вне выкатки, и правка дороги перестала бы
# ехать тем же sha, что и всё остальное.
COPY --from=build /workspace/dist/apps/message-bus-admin/browser /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443

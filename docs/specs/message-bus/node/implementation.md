# Узел и поставка — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

У трёх правил дороги названо по два места. Настоящее — конфиг проксировщика, но имени файла
без расширения сверка якорей не узнаёт вовсе и считает такую строку пустой привязкой; вторым
назван тот же конфиг строкой, которой он попадает в образ дороги.

- **Приёмник отвечает только по защищённому соединению.** — `deploy/Caddyfile:http`, в образ его кладёт `deploy/message-bus-web.Dockerfile:Caddyfile`
- **Сертификат выписывает и продлевает проксировщик сам.** — `docker-compose.prod.yml:message-bus-caddy-data`
- **Наружу узел открывает только два порта дороги.** — `docker-compose.prod.yml:ports`
- **Админка и приём отвечают с одного имени.** — `deploy/Caddyfile:reverse_proxy`, в образ его кладёт `deploy/message-bus-web.Dockerfile:Caddyfile`
- **Адрес раздела админки открывается прямой ссылкой.** — `deploy/Caddyfile:try_files`, в образ его кладёт `deploy/message-bus-web.Dockerfile:Caddyfile`
- **Узел поднимает готовый образ, а не собирает его у себя.** — `docker-compose.prod.yml:image`
- **Образ на узле опознаётся sha коммита, а не подвижной меткой.** — `docker-compose.prod.yml:IMAGE_TAG`
- **Миграции накатываются до того, как приёмник начинает отвечать.** — `docker-compose.prod.yml:depends_on`
- **Выкатка начинается рукой человека, а не слиянием.** — `.github/workflows/deploy.yml:workflow_dispatch`
- **Выкатка кончается пробой живости, а не подъёмом контейнеров.** — `.github/workflows/deploy.yml:health`
- **После удачной пробы узел оставляет три последних sha.** — `deploy/prune-images.sh:KEEP`
- **Чистка отбирает образы по имени своего реестра, а не по возрасту.** — `deploy/prune-images.sh:REFERENCE`
- **Хранилище лежит на именованном томе, а не внутри контейнера.** — `docker-compose.prod.yml:volumes`
- **Контейнеры поднимаются сами после перезапуска узла.** — `docker-compose.prod.yml:restart`
- **Дамп снимается и загружается одной командой каждый.** — `deploy/dump.sh:DUMPS`
- **Загруженный дамп возвращает и свод, и годность выданных токенов.** — `deploy/dump.sh:compose`
- **Адрес приёма в настройке дерева — имя, а не местная машина.** — `.claude/rt-kit.json:intake`
- **Сборка приёмника отказывает, когда клиента хранилища нет.** — `apps/message-bus/src/build/storage-client.check.mjs:storageClientFailure`
- **Отказ называет и причину, и починку.** — `apps/message-bus/src/build/storage-client.check.mjs:GENERATE_COMMAND`
- **Проверка идёт до компиляции.** — `apps/message-bus/webpack.config.mjs:failure`
- **Решение живёт чистой функцией, а конфиг сборки её зовёт.** — `apps/message-bus/src/build/storage-client.check.mjs:STORAGE_CLIENT_ENTRY`
- **Конвейер собирает приёмник, и отказ сборки роняет прогон.** — `.github/workflows/ci.yml:affected`

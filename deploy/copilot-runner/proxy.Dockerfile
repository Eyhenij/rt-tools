# Прокси раннера ревью Copilot — единственный выход контейнера раннера наружу.
#
# Раннер стоит во внутренней сети Docker без выхода. Прокси подключён к ней и к обычной сети и
# пропускает только хосты из `allowlist`: Actions, GitHub и Copilot. Остальное он не пропускает.
FROM alpine:3.20

RUN apk add --no-cache tinyproxy

COPY tinyproxy.conf /etc/tinyproxy/tinyproxy.conf
COPY allowlist /etc/tinyproxy/allowlist

USER tinyproxy
EXPOSE 8888
ENTRYPOINT ["tinyproxy", "-d", "-c", "/etc/tinyproxy/tinyproxy.conf"]

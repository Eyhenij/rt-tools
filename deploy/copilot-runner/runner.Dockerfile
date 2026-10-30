# Одноразовый раннер ревью Copilot.
#
# Ревью Copilot идёт только на Ubuntu x64, а машина владельца — Apple Silicon: образ собирается
# под linux/amd64 и исполняется через эмуляцию Docker. Контейнер живёт одно задание: `runner-loop.sh`
# поднимает его с одноразовой регистрацией и удаляет после.
#
# Сокета Docker, ключей и домашней папки владельца в контейнере нет. Наружу он ходит только через
# прокси со списком хостов (`proxy.Dockerfile`).
FROM --platform=linux/amd64 ubuntu:24.04

# Версия и сумма берутся со страницы выпуска actions/runner. Сумма сверяется до распаковки: архив
# без сверки — чужой код в контейнере, где исполняется ревью
ARG RUNNER_VERSION=2.338.2
ARG RUNNER_SHA256=baebf204307bac6193480852732f0aba2ae97b6c5597c244f4d5558390147c40

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl git jq \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash runner
WORKDIR /home/runner

RUN curl -fsSL -o runner.tar.gz \
        "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" \
    && echo "${RUNNER_SHA256}  runner.tar.gz" | sha256sum -c - \
    && tar xzf runner.tar.gz \
    && rm runner.tar.gz \
    && ./bin/installdependencies.sh \
    && rm -rf /var/lib/apt/lists/* \
    && chown -R runner:runner /home/runner

USER runner

# Регистрация приходит переменной `ACTIONS_RUNNER_INPUT_JITCONFIG`: раннер берёт одно задание и
# снимается с учёта сам
ENTRYPOINT ["./run.sh"]

#!/usr/bin/env bash
# Набор о самой обвязке наборов: переживает ли она окружение git, оставленное снаружи.
#
# Закрывает SC-AK-956 спека `docs/specs/agent-kit/guards`.
#
# Судится соседний набор, а не гард: сценарии заводят одноразовые репозитории и говорят с ними
# через `git -C <путь>`, а `GIT_DIR`, `GIT_WORK_TREE` и `GIT_INDEX_FILE` этот путь перебивают.
# Репозиторий, на который они укажут, здесь выброшенный: если обвязка перестанет их снимать, следы
# лягут в него, а не в дерево.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "обвязка наборов и окружение git"

# Набор для проверки взят тот, что первым и покраснел: его сценарии работают с ветками и
# основаниями, то есть трогают git на каждом шагу.
VICTIM="$(dirname "${BASH_SOURCE[0]}")/guard-epic-base.test.sh"

FOREIGN="$(mktemp -d)"
cleanup() { rm -rf "$FOREIGN"; }
trap cleanup EXIT

git -C "$FOREIGN" init -q
git -C "$FOREIGN" -c user.name=probe -c user.email=probe@example.com commit -q --allow-empty -m start
BEFORE="$(git -C "$FOREIGN" rev-list --count HEAD)"

for name in GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; do
    if env "$name=$FOREIGN/.git" bash "$VICTIM" >/dev/null 2>&1; then
        got="прошёл"
    else
        got="отбит"
    fi
    report "SC-AK-956 — набор проходит при выставленной $name" "$got" "прошёл"
done

# Второй признак, и он дороже первого: даже пройдя, набор не имеет права оставить след снаружи.
report "SC-AK-956 — в чужом репозитории не прибавилось коммитов" \
    "$(git -C "$FOREIGN" rev-list --count HEAD)" "$BEFORE"
report "SC-AK-956 — в чужом репозитории не завелось веток" \
    "$(git -C "$FOREIGN" for-each-ref --format='%(refname:short)' refs/heads | wc -l | tr -d ' ')" "1"

suite_result "обвязка наборов и окружение git"

#!/usr/bin/env bash
# Случаи узла перемера: версия node, на которой защита доставки гоняет шаги перед PR. Набор
# запускается сам, и его же подключает набор движка `task-flow-script.test.sh`: тот считает эти
# случаи в своём выводе. Подключённый, набор берёт у него `TF_DIR`, `TESTS` и `report`.
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    . "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
    echo "сценарий task flow: узел перемера"
    TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    TF_DIR="$(mktemp -d)"
    TF_NODE_ALONE=1
fi

# SC-AK-1740 — перемер идёт на node, закреплённом в .nvmrc дерева
TF_NVM="$TF_DIR/nvm"
mkdir -p "$TF_NVM/versions/node/v99.1.0/bin" "$TF_DIR/pinned-tree"
printf '#!/usr/bin/env bash\necho "pinned node"\nexit 1\n' > "$TF_NVM/versions/node/v99.1.0/bin/node"
chmod +x "$TF_NVM/versions/node/v99.1.0/bin/node"
tf_pinned() {
    (
        unmet() { printf '%s %s\n' "$1" "$3"; }
        rt_hooks_dir="$TESTS/../assets/hooks" root="$TF_DIR/pinned-tree" NVM_DIR="$TF_NVM"
        . "$TESTS/../assets/hooks/git-guard-delivery-rerun.sh"
        rt_delivery_rerun
    )
}
printf 'v99.1.0\n' > "$TF_DIR/pinned-tree/.nvmrc"
report "pr: SC-AK-1740 — перемер зовёт node из .nvmrc дерева" "$(tf_pinned | grep -c 'pinned node')" 1
printf 'v99.0.5\n' > "$TF_DIR/pinned-tree/.nvmrc"
report "pr: SC-AK-1740 — без точной версии перемер берёт более новую той же главной" "$(tf_pinned | grep -c 'pinned node')" 1
rm "$TF_DIR/pinned-tree/.nvmrc"
report "pr: SC-AK-1740 — без .nvmrc остаётся node сессии" "$(tf_pinned | grep -c 'pinned node')" 0

if [ -n "${TF_NODE_ALONE:-}" ]; then
    rm -rf "$TF_DIR"
    suite_result "сценарий task flow: узел перемера"
fi

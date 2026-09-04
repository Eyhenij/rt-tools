#!/usr/bin/env bash
# Сценарии гарда документов: код не едет без документа, который его описывает.
#
# Гард читает подготовленное к коммиту, поэтому набор поднимает свой репозиторий и кладёт в
# индекс ровно то, что проверяет: пара «правка и её документ», спутник правила и обход причиной.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард документов"

REPO="$(fixture_repo RT-7-probe)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$REPO"; }
trap cleanup EXIT

mkdir -p "$REPO/libs/site/x/ui/src/lib" "$REPO/docs" "$REPO/.claude/skills/probe-rule" "$REPO/docs/constitution"
git -C "$REPO" add -A >/dev/null 2>&1
git -C "$REPO" -c user.email=t@t -c user.name=t commit -qm init >/dev/null 2>&1

stage() {
    git -C "$REPO" reset -q >/dev/null 2>&1
    for path in "$@"; do
        mkdir -p "$REPO/$(dirname "$path")"
        printf 'правка %s\n' "$(date +%s%N 2>/dev/null || echo x)" >> "$REPO/$path"
        git -C "$REPO" add "$path" >/dev/null 2>&1
    done
}

g() { expect_decision "$1" docs-guard.sh "$(input_cmd "$2" Bash "$REPO")" "$3"; }

# --- граница команд -----------------------------------------------------------------------
# Гард стоит на коммите: всё остальное его не касается, даже если правка кода в индексе лежит.
stage libs/site/x/ui/src/lib/a.component.ts
g "сборка гарду безразлична" 'pnpm exec nx build site' PASS
g "чтение истории безразлично" 'git log --oneline' PASS

# --- пара, которую называет профиль ------------------------------------------------------------
# Что с чем в паре, знает профиль дерева, а гард держит механику. Умолчание пакета называет две
# пары; проверяется та, что не зависит от раскладки конкретного дерева, — контракт и спек.
stage libs/common/proto/proto/x/v1/x.proto
g "контракт правится без спека домена" 'git commit -m "feat(proto): x"' deny

stage libs/common/proto/proto/x/v1/x.proto docs/specs/x/spec.md
g "контракт со спеком в том же коммите" 'git commit -m "feat(proto): x"' PASS

# Код, у которого пары не объявлено, гард не держит: пара называется профилем поимённо, а не
# выводится из того, что файл выглядит кодом.
stage libs/site/x/ui/src/lib/a.component.ts
g "код без объявленной пары" 'git commit -m "feat(site): x"' PASS

# --- SC-AK-849. Файл, положенный раскладкой, пары не требует -----------------------------------
# Автор у него в дереве-потребителе один — пакет, и документ о нём лежит там же. Раньше первая же
# раскладка требовала обход на весь свой объём, а обход, объявленный на сотню файлов, снимал
# требование и с будущих правок этих файлов вручную. Признак — шапка раскладки.
stage libs/common/proto/proto/x/v1/laid.proto
printf '// rt-kit v0.23.0 · proto/laid.proto · 0123456789ab · правится надстройкой, не здесь\n' \
    > "$REPO/libs/common/proto/proto/x/v1/laid.proto"
git -C "$REPO" add libs/common/proto/proto/x/v1/laid.proto >/dev/null 2>&1
g "SC-AK-849 — разложенный файл пары не требует" 'git commit -m "chore: раскладка"' PASS

# Тот же файл без шапки проверяется как раньше.
stage libs/common/proto/proto/x/v1/own.proto
g "SC-AK-849 — свой файл дерева пары требует" 'git commit -m "feat(proto): x"' deny

# --- обход причиной --------------------------------------------------------------------------
# «Docs-skip:» без причины — тот же молчаливый пропуск, только с двоеточием.
stage libs/common/proto/proto/x/v1/x.proto
g "обход без причины" 'git commit -m "feat(proto): x

Docs-skip:"' deny
g "обход с причиной" 'git commit -m "feat(proto): x

Docs-skip: правка только в комментарии контракта, спек её не видит"' PASS
# Тело, которое ОБЪЯСНЯЕТ обход, от самого обхода отличается двумя признаками: строку оно не
# начинает, а причина у него — подстановка. Без обоих условий требование снимал текст о правке
# самого гарда — тот, в котором эта строка и называется.
stage libs/common/proto/proto/x/v1/x.proto
g "упоминание обхода посреди строки" 'git commit -m "feat(proto): x

обход тут ставится строкой Docs-skip: причина в теле коммита"' deny
g "подстановка вместо причины" 'git commit -m "feat(proto): x

Docs-skip: <причина>"' deny

# --- спутник правила ---------------------------------------------------------------------------
# Утверждения правила и его привязка расходятся молча, поэтому пара у них своя: правится раздел
# утверждений — в коммит идёт спутник рядом.
printf '%s\n' '---' 'name: probe-rule' 'kind: rule' 'law: verifiability' '---' '' '# Правило' '' \
    '## Как закон применяется здесь' '' '- **Утверждение первое.** Довод.' > "$REPO/.claude/skills/probe-rule/SKILL.md"
printf '# probe-rule — что здесь своё\n\n| Правило | Где |\n| - | - |\n' > "$REPO/.claude/skills/probe-rule/implementation.md"
git -C "$REPO" add -A >/dev/null 2>&1
git -C "$REPO" -c user.email=t@t -c user.name=t commit -qm "chore: правило" >/dev/null 2>&1

git -C "$REPO" reset -q >/dev/null 2>&1
printf -- '- **Утверждение второе.** Довод.\n' >> "$REPO/.claude/skills/probe-rule/SKILL.md"
git -C "$REPO" add .claude/skills/probe-rule/SKILL.md >/dev/null 2>&1
g "утверждения правила без спутника" 'git commit -m "docs: правило"' deny

printf '| Утверждение второе. | `a.ts:x` |\n' >> "$REPO/.claude/skills/probe-rule/implementation.md"
git -C "$REPO" add .claude/skills/probe-rule/implementation.md >/dev/null 2>&1
g "утверждения правила со спутником" 'git commit -m "docs: правило"' PASS

# --- правка закона спрашивает владельца ---------------------------------------------------------
# Закон описывает договорённость о продукте: менять её молча гард не даёт. Путей к тексту закона
# два — сам файл и надстройка над ним, — и вопрос один на оба: разложенную копию переписывает
# раскладка, поэтому правка надстройки и есть правка закона. Привязка статей к коду устаревает
# при каждом переименовании и правится свободно с обеих сторон.
e() { expect_decision "$1" docs-guard.sh "$(input_edit "$REPO/$2" "$3")" "$4"; }

e "правка закона на месте" 'docs/constitution/verifiability.md' 'новая статья' ask
e "привязка статей к коду" 'docs/constitution/verifiability.implementation.md' '| Статья | Где |' PASS
e "правка закона надстройкой" '.claude/rt-kit/overrides/laws/verifiability.md' '## Ловушки' ask
e "привязка статей в надстройке" '.claude/rt-kit/overrides/laws/verifiability.implementation.md' '| Статья | Где |' PASS
e "надстройка над правилом" '.claude/rt-kit/overrides/rules/task-flow.md' '## Ловушки' PASS

expect_reason "вопрос о надстройке называет закон" docs-guard.sh \
    "$(input_edit "$REPO/.claude/rt-kit/overrides/laws/delivery.md" '## Ловушки')" \
    'правка самого закона'

# SC-AK-410. Отказ доезжает до читателя вместе с хвостом: два законных хода и законная форма
# обхода. Проверяется на живом отказе, а не по исходнику гарда — хвост, собранный в переменную и
# не попавший в поле вывода, из исходника выглядит поставленным.
stage libs/common/proto/proto/x/v1/x.proto
expect_reason "SC-AK-410 — отказ называет два законных хода" docs-guard.sh \
    "$(input_cmd 'git commit -m "feat(proto): x"' Bash "$REPO")" \
    'Ходов отсюда два'
expect_reason "SC-AK-410 — отказ называет законную форму обхода" docs-guard.sh \
    "$(input_cmd 'git commit -m "feat(proto): x"' Bash "$REPO")" \
    'Законная форма обхода: строка'

# --- отказ в пользу работы -----------------------------------------------------------------------
printf '' | "$HOOKS/docs-guard.sh" >/dev/null 2>&1
report "пустой вход пропускается" "код:$?" "код:0"
printf 'не json' | "$HOOKS/docs-guard.sh" >/dev/null 2>&1
report "неразбираемый вход пропускается" "код:$?" "код:0"

BARE="$(mktemp -d)"
out="$(input_cmd 'git commit -m x' Bash "$BARE" | "$HOOKS/docs-guard.sh" 2>/dev/null)"
[ -z "$out" ] && report "вне репозитория пропускается" PASS PASS || report "вне репозитория пропускается" deny PASS
rm -rf "$BARE"

suite_result "гард документов"

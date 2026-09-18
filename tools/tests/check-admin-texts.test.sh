#!/usr/bin/env bash
# The scenarios of the check of a word for a person: what it catches in the markup and in the code,
# what it lets through deliberately and what it says about an entry of the list that answers to
# nothing.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the check of words past the dictionary"

WORK="$(fixture_tree)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cp "$TOOLS/check-admin-texts.mjs" "$WORK/tools/"
printf '{\n    "accepted": {}\n}\n' > "$WORK/tools/admin-texts-allowlist.json"

MARKUP="$WORK/libs/message-bus-admin/invites/feature/list/src/lib"
DICTIONARY="$WORK/libs/message-bus-admin/common/core/util/src/lib"
mkdir -p "$MARKUP" "$DICTIONARY"

# The check reads the files from version control: a file outside it reaches no branch.
git -C "$WORK" init --quiet
git -C "$WORK" config user.email probe@example.com
git -C "$WORK" config user.name probe

commit() {
    git -C "$WORK" add -A >/dev/null 2>&1
    git -C "$WORK" -c commit.gpgsign=false commit -q -m probe >/dev/null 2>&1 || true
}

clean_tree() {
    printf '<rt-aside [ariaLabel]="title()">\n    <p>{{ hint() }}</p>\n</rt-aside>\n' > "$MARKUP/list.component.html"
    printf "const BLOCK: string = 'admin-invites-list';\n" > "$MARKUP/list.component.ts"
    commit
}

verdict() {
    local label="$1" want="$2" got
    if node "$WORK/tools/check-admin-texts.mjs" >/dev/null 2>&1; then got="green"; else got="red"; fi
    report "$label" "$got" "$want"
}

says() {
    local label="$1" pattern="$2" got
    if node "$WORK/tools/check-admin-texts.mjs" 2>&1 | grep -qE "$pattern"; then got="yes"; else got="no"; fi
    report "$label" "$got" "yes"
}

# --- the markup ------------------------------------------------------------------------------
clean_tree
verdict "SC-MB-416 — a tree taking its labels from the dictionary passes" "green"

printf '<p>Приглашений нет</p>\n' >> "$MARKUP/list.component.html"
commit
verdict "SC-MB-416 — a label written into the markup is refused" "red"
says "SC-MB-416 — the refusal names the file and the word" 'list.component.html «Приглашений нет»'

clean_tree
printf '<!-- Подсказка раздела: её рисует общий экран -->\n' >> "$MARKUP/list.component.html"
commit
verdict "SC-MB-416 — a word inside a comment of the markup is lawful" "green"

# The value of an attribute is shown to a person no less than a text node.
clean_tree
printf '<button aria-label="Пригласить"></button>\n' >> "$MARKUP/list.component.html"
commit
verdict "SC-MB-416 — a word in the value of an attribute is refused" "red"

# --- the code --------------------------------------------------------------------------------
clean_tree
printf "const HINT: string = 'Записей нет';\n" >> "$MARKUP/list.component.ts"
commit
verdict "SC-MB-416 — a string of the code with a word for a person is refused" "red"
says "SC-MB-416 — the refusal names the word" 'list.component.ts «Записей нет»'

clean_tree
printf '// Подпись берётся из словаря по ключу\n' >> "$MARKUP/list.component.ts"
printf '/* И этот разбор тоже написан по-русски */\n' >> "$MARKUP/list.component.ts"
commit
verdict "SC-MB-416 — a comment of the code is lawful" "green"

# --- what is out of the count ------------------------------------------------------------------
clean_tree
printf "export const ADMIN_LABELS = { listEmpty: 'Записей нет' };\n" > "$DICTIONARY/admin-labels.ts"
commit
verdict "SC-MB-416 — the set of the labels itself is not judged" "green"

clean_tree
printf "it('SC-MB-1 — экран называет раздел', () => expect(1).toBe(1));\n" > "$MARKUP/list.component.spec.ts"
commit
verdict "SC-MB-416 — a spec is not judged: its words are the promise of the test" "green"

# --- the accepted list --------------------------------------------------------------------------
clean_tree
printf '<p>Приёмник</p>\n' >> "$MARKUP/list.component.html"
commit
printf '{\n    "accepted": {\n        "libs/message-bus-admin/invites/feature/list/src/lib/list.component.html «Приёмник»": {\n            "reason": "the probe of the set",\n            "task": "RT-2214"\n        }\n    }\n}\n' \
    > "$WORK/tools/admin-texts-allowlist.json"
verdict "SC-MB-416 — a named place is let through" "green"

clean_tree
verdict "SC-MB-416 — an entry of the list that answers to nothing is refused" "red"
says "SC-MB-416 — the refusal says the entry is removed" 'answers to nothing any more'

suite_result "the check of words past the dictionary"

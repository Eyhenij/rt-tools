#!/usr/bin/env bash
# The scenarios of the release journal split: the journal is counted as the commit will hold it.
#
# Covers SC-AK-680 of the spec `docs/specs/agent-kit/checks`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the release journal split"

WORK="$(fixture_tree)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cp "$TOOLS/changelog-split.mjs" "$WORK/tools/"
# The formatter is taken from this repository: the fixture has no dependencies of its own.
ln -s "$TOOLS/../node_modules" "$WORK/node_modules"
cp "$TOOLS/../.prettierrc.json" "$WORK/"
mkdir -p "$WORK/projects/probe"
JOURNAL="projects/probe/CHANGELOG.md"

# A journal of the given length in raw lines. The freshest release heading stands right on top of
# the next one, without a blank line between them: that is how the generator leaves a release
# with no entries, and the formatter adds the blank line at the commit.
journal() {
    node -e '
        const total = Number(process.argv[1]);
        const lines = ["## [9.0.1](https://example.invalid/compare) (2026-10-10)"];
        let n = 9000;
        while (lines.length < total - 4) {
            lines.push(`## [0.${n}.0](https://example.invalid/compare) (2026-10-09)`, "", `- fix ${n}`, "");
            n -= 1;
        }
        while (lines.length < total - 1) lines.push(`- fix ${n}-${lines.length}`);
        lines.push("");
        process.stdout.write(lines.join("\n"));
    ' "$1" > "$WORK/$JOURNAL"
}

split() {
    (cd "$WORK" && node tools/changelog-split.mjs "$JOURNAL" >/dev/null 2>&1)
}

lines_of() {
    node -e 'process.stdout.write(String(require("fs").readFileSync(process.argv[1], "utf8").split("\n").length))' "$1"
}

# 500 raw lines are within the limit; the formatter makes them 501. The positive side goes first:
# the fixture really stands on the limit, otherwise a missing split would prove nothing.
journal 500
report "сырой журнал стоит на пределе" "$(lines_of "$WORK/$JOURNAL")" 500
split
report "SC-AK-680 — журнал, переросший предел после форматирования, поделён" \
    "$(ls "$WORK/projects/probe" | grep -c '^CHANGELOG-')" 1
report "SC-AK-680 — свежая часть укладывается в предел" \
    "$([ "$(lines_of "$WORK/$JOURNAL")" -le 500 ] && echo yes || echo no)" yes

# The commit hook formats the staged files: what the split wrote must not change under it.
checked=0
changed=0
for file in "$WORK"/projects/probe/CHANGELOG*.md; do
    checked=$((checked + 1))
    (cd "$WORK" && node_modules/.bin/prettier --check "$file" >/dev/null 2>&1) || changed=$((changed + 1))
done
report "SC-AK-680 — проверены обе части" "$checked" 2
report "SC-AK-680 — обе части уже отформатированы" "$changed" 0

# A short journal is left in place, only formatted.
rm -f "$WORK"/projects/probe/CHANGELOG*.md
journal 40
split
report "короткий журнал не делится" "$(ls "$WORK/projects/probe" | grep -c '^CHANGELOG-')" 0

suite_result "the release journal split"
[ "$FAILED" -eq 0 ]

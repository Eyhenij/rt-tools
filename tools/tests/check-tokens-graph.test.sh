#!/usr/bin/env bash
# The scenarios of the token graph check's reading of the first kit: a name the first kit declares by
# interpolation over a scale counts as its own name.
#
# Covers SC-UKV-133 of `docs/specs/ui-kit-v2/tokens`. The first kit declares its radii and shadows by
# `@each` over a map, and a literal search never saw them: the first reference to `--rt-shadow-md` from
# the first kit read as a new collision, and the styling rule became unkeepable.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the first kit's names declared by interpolation"

WORK="$(fixture_tree)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cp "$TOOLS/check-tokens-graph.mjs" "$WORK/tools/"
printf '{\n  "accepted": {}\n}\n' > "$WORK/tools/tokens-graph-allowlist.json"
printf '{\n  "handles": {}\n}\n' > "$WORK/tools/tokens-handles.json"

KIT="$WORK/projects/ui-kit-v2/src/styles"
FIRST="$WORK/projects/ui-kit/src/styles"
mkdir -p "$KIT" "$FIRST" "$WORK/projects/ui-kit-v2/docs"
: > "$WORK/projects/ui-kit-v2/docs/Theming.mdx"
printf ':root {\n    --rt-shadow-md: 0 1px 2px black;\n    --rt-radius-control: 4px;\n}\n' > "$KIT/_primitives.scss"

# The first kit's scale: a nested value holds commas and brackets of its own, and it must not tear
# the list of keys.
first_kit() {
    cat > "$FIRST/_tokens.scss" <<EOF
\$shadow: (
    sm: (
        0 1px 2px rgb(0 0 0 / 12%),
    ),
    $1: (
        0 2px 4px rgb(0 0 0 / 14%),
    ),
);
:root {
    @each \$token, \$value in \$shadow {
        --rt-shadow-#{\$token}: #{\$value};
    }
}
EOF
}

run() {
    (cd "$WORK" && node tools/check-tokens-graph.mjs 2>&1)
}

first_kit md
says="$(run)"
case "$says" in
    *'check-tokens-graph: divergences'*) report "SC-UKV-133 — the check ran to the collision section" да да ;;
    *) report "SC-UKV-133 — the check ran to the collision section" "нет: $says" да ;;
esac
case "$says" in
    *'--rt-shadow-md — the name is used by both kits'*) report "SC-UKV-133 — an interpolated name collides" да да ;;
    *) report "SC-UKV-133 — an interpolated name collides" нет да ;;
esac

# The reverse side: a key the map does not hold gives no name, and the check is green on the same
# second-kit declaration.
first_kit lg
says="$(run)"
case "$says" in
    *'there are no new divergences'*) report "SC-UKV-133 — a key the map lacks gives no collision" да да ;;
    *) report "SC-UKV-133 — a key the map lacks gives no collision" "нет: $says" да ;;
esac

suite_result "check-tokens-graph"

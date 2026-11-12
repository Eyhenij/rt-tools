#!/usr/bin/env bash
# The scenarios of the dependencies check: an exact version, the written waiting term and the paths
# of the commit formatter.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the dependencies rule on a one-off tree"

WORK="$(fixture_tree)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cp "$TOOLS/check-dependencies.mjs" "$WORK/tools/"
mkdir -p "$WORK/.husky"

# The fixture is written whole every time: the cases differ by one of its four parts.
tree() {
    printf '{\n  "dependencies": { "left-pad": "%s" },\n  "lint-staged": { "%s": "prettier --write" }\n}\n' "$1" "$2" \
        > "$WORK/package.json"
    printf '%b' "$3" > "$WORK/pnpm-workspace.yaml"
    printf '%b' "$4" > "$WORK/.husky/pre-commit"
}

verdict() {
    local label="$1" want="$2" got
    if node "$WORK/tools/check-dependencies.mjs" >/dev/null 2>&1; then got="green"; else got="red"; fi
    report "$label" "$got" "$want"
}

says() {
    local label="$1" pattern="$2" got
    if node "$WORK/tools/check-dependencies.mjs" 2>&1 | grep -qE -- "$pattern"; then got="yes"; else got="no"; fi
    report "$label" "$got" "yes"
}

GLOB='{apps,libs}/**/*.{js,ts,scss}'
TERM_LINE='minimumReleaseAge: 1440\n'
HOOK='npx lint-staged\n'

tree '1.3.0' "$GLOB" "$TERM_LINE" "$HOOK"
verdict "an exact version, a written term, linted paths" green

tree '^1.3.0' "$GLOB" "$TERM_LINE" "$HOOK"
verdict "a caret range is refused" red
says "the range is named with its package" 'left-pad@\^1\.3\.0'

tree '1.3.0-rc.1' "$GLOB" "$TERM_LINE" "$HOOK"
verdict "a pre-release number is exact" green

tree 'workspace:*' "$GLOB" "$TERM_LINE" "$HOOK"
verdict "a workspace link is no registry version" green

tree '19.0.0-rc-66855b96-20241106' "$GLOB" "$TERM_LINE" "$HOOK"
verdict "a hyphen inside the pre-release tail is exact" green

tree '~1.3.0' "$GLOB" "$TERM_LINE" "$HOOK"
verdict "a tilde range is refused" red

tree 'npm:right-pad@1.3.0' "$GLOB" "$TERM_LINE" "$HOOK"
verdict "an alias with an exact number passes" green

tree 'npm:right-pad@^1.3.0' "$GLOB" "$TERM_LINE" "$HOOK"
verdict "an alias with a range is refused" red

tree '1.3.0' "$GLOB" 'minimumReleaseAge: 1440 # a day\n' "$HOOK"
verdict "a comment after the term is read past" green

tree '1.3.0' "$GLOB" "minimumReleaseAge: '1440'\n" "$HOOK"
verdict "a quoted term is read" green

tree '1.3.0' "$GLOB" 'packages:\n  - projects/*\n' "$HOOK"
verdict "a missing waiting term is refused" red
says "the missing term is named" 'no minimumReleaseAge'

tree '1.3.0' "$GLOB" 'minimumReleaseAge: 0\n' "$HOOK"
verdict "a zero waiting term is refused" red

tree '1.3.0' "$GLOB" 'minimumReleaseAgeExclude:\n  - left-pad@1.3.0\n' "$HOOK"
verdict "the exclusion list alone is no term" red

tree '1.3.0' 'projects/**/src/**/*.{js,ts,md,json}' "$TERM_LINE" "$HOOK"
verdict "the formatter over texts and settings is refused" red
says "the foreign extensions are named" 'md, json'

tree '1.3.0' 'libs/**/*.ts' "$TERM_LINE" "$HOOK"
verdict "a glob of one linted extension under a linted directory passes" green

tree '1.3.0' 'tools/eslint-rules/**/*.ts' "$TERM_LINE" "$HOOK"
verdict "the linter's own rules are a linted directory" green

tree '1.3.0' 'projects/**/*' "$TERM_LINE" "$HOOK"
verdict "a glob without an extension is refused" red
says "the missing extension is named" 'takes \*'

tree '1.3.0' '**/*.ts' "$TERM_LINE" "$HOOK"
verdict "a linted extension over the whole tree is refused" red
says "the whole tree is named" 'starts from \*'

tree '1.3.0' '{projects,tools}/**/*.ts' "$TERM_LINE" "$HOOK"
verdict "a directory without a lint run is refused" red
says "the directory is named" 'starts from tools '

tree '1.3.0' "$GLOB" "$TERM_LINE" 'prettier $(git diff --cached --name-only) --write\nnpx lint-staged\n'
verdict "the formatter called by the hook itself is refused" red
says "the hook is named" 'husky/pre-commit'

tree '1.3.0' "$GLOB" "$TERM_LINE" 'pnpm run prettier\nnpx lint-staged\n'
verdict "the formatter called through a script of the manifest is refused" red

tree '1.3.0' "$GLOB" "$TERM_LINE" 'git diff --cached --name-only | xargs node_modules/.bin/prettier --write\n'
verdict "the formatter called by its path in a pipe is refused" red

tree '1.3.0' "$GLOB" "$TERM_LINE" '# prettier is called by lint-staged\nnpx lint-staged\n'
verdict "a comment naming the formatter passes" green

printf '{\n  "devDependencies": { "left-pad": "^1.3.0" }\n}\n' > "$WORK/package.json"
verdict "a range in the tool dependencies is refused" red

printf '{\n  "dependencies": { "left-pad": "1.3.0" },\n  "lint-staged": { "**/*.md": ["eslint --fix", "prettier --write"] }\n}\n' > "$WORK/package.json"
verdict "a list of commands with the formatter in it is judged" red

rm "$WORK/pnpm-workspace.yaml" "$WORK/.husky/pre-commit"
printf '{\n  "dependencies": { "left-pad": "1.3.0" }\n}\n' > "$WORK/package.json"
verdict "a tree without pnpm settings and without a hook passes" green

printf '{ broken' > "$WORK/package.json"
report "a manifest that does not parse is a broken subject" \
    "$(node "$WORK/tools/check-dependencies.mjs" >/dev/null 2>&1; echo $?)" "2"

rm "$WORK/package.json"
verdict "a tree without a manifest has nothing to judge" green

suite_result "check-dependencies"

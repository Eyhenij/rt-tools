#!/usr/bin/env bash
# The dot directories in the Angular Doctor check (RT-3640): neither the tool nor the pass enters one. A
# part of `check-ngdoctor.test.sh`, attached by it: the fixtures and the verdicts are its own.

# A copy of the check in a tree of its own runs the installed tool.
DOT="$WORK/dot"
dot_tree() {
    rm -rf "$DOT"
    mkdir -p "$DOT/tools"
    cp "$CHECK" "$TOOLS/check-ngdoctor-pass.mjs" "$TOOLS/check-ngdoctor-settings.mjs" "$TOOLS/ngdoctor-dot-dirs.mjs" "$DOT/tools/"
    cp "$TOOLS/../package.json" "$TOOLS/../angular-doctor.config.json" "$DOT/"
    ln -s "$(cd "$TOOLS/.." && pwd -P)/node_modules" "$DOT/node_modules"
}
# The verdict of that copy with the given flags; the reason it has to name is the first argument.
dot_says() {
    local reason="$1"
    shift
    if node "$DOT/tools/check-ngdoctor.mjs" "$@" > "$WORK/said.txt" 2>&1; then echo "green"
    elif grep -qF -- "$reason" "$WORK/said.txt"; then echo "red, named"; else echo "red, other reason"; fi
}
PROBE_REAL=(--input "$WORK/tree.json" --threshold "$WORK/threshold.json" --probe-real)
UNLOADED="angular-doctor listed its files without tools/ngdoctor-dot-dirs.mjs"
dot_tree
report "the real probe with the dot dir skip is green" "$(dot_says "$UNLOADED" "${PROBE_REAL[@]}")" "green"
sed -i.bak "s/'--import', DOT_DIRS_MODULE, //" "$DOT/tools/check-ngdoctor.mjs"
report "a run of the tool without the dot dir skip is red" "$(dot_says "$UNLOADED" "${PROBE_REAL[@]}")" "red, named"

# The fast-glob of the tool without the place the skip is added at.
dot_tree
rm "$DOT/node_modules"
mkdir -p "$DOT/node_modules/@abiramcodes/angular-doctor" "$DOT/node_modules/fast-glob/out/managers"
printf '%s\n' '{"name": "@abiramcodes/angular-doctor", "version": "0.3.0"}' > "$DOT/node_modules/@abiramcodes/angular-doctor/package.json"
printf '%s\n' '{"name": "fast-glob", "version": "4.0.0"}' > "$DOT/node_modules/fast-glob/package.json"
printf '%s\n' 'exports.plan = () => [];' > "$DOT/node_modules/fast-glob/out/managers/tasks.js"
dot_loaded() {
    if NGDOCTOR_DOT_DIRS_MARK="$WORK/mark" node --import "$DOT/tools/ngdoctor-dot-dirs.mjs" -e '' > "$WORK/said.txt" 2>&1; then echo "went on"
    elif grep -qF -- "$1" "$WORK/said.txt"; then echo "stopped, named"; else echo "stopped, other reason"; fi
}
report "a fast-glob that takes no dot dir skip stops the run" "$(dot_loaded "has no function «generate»")" "stopped, named"
rm "$DOT/node_modules/fast-glob/out/managers/tasks.js"
report "a fast-glob without the module of the dot dir skip stops the run" "$(dot_loaded "does not skip the dot directories: Cannot find module")" "stopped, named"

# A tree inside a dot directory, as a working copy of a session is. Its own files are read whole, its
# packages are left out by the ignore list, and its dot directories — at the root, below it and one in
# another — hold a directory nobody can list: a walk stops on it, synchronous or not.
DOTTED="$WORK/.copies/one"
pass_tree
mkdir -p "$DOTTED/projects/e2e" "$DOTTED/node_modules/x" "$DOTTED/.claude/worktrees/locked" "$DOTTED/src/.other/locked" "$DOTTED/.a/.b/locked"
cp -R "$PASS/src" "$DOTTED/"
cp "$PASS/src/a.component.ts" "$DOTTED/node_modules/x/"
cp "$PASS/src/a.component.ts" "$DOTTED/projects/e2e/"
printf '%s\n' '{"version": 1, "projects": {"p": {"root": "", "sourceRoot": "src", "projectType": "application"}}}' > "$DOTTED/angular.json"
printf '%s\n' '{"name": "p", "devDependencies": {"tailwindcss": "^4.1.0"}}' > "$DOTTED/package.json"
printf '%s\n' '.x { color: red; }' > "$DOTTED/src/x.css"
chmod 000 "$DOTTED/.claude/worktrees/locked" "$DOTTED/src/.other/locked" "$DOTTED/.a/.b/locked"
dot_tool() {
    NGDOCTOR_DOT_DIRS_MARK="$WORK/mark" node "$@" "$TOOLS/../node_modules/@abiramcodes/angular-doctor/bin/angular-doctor.js" --json "$DOTTED" > "$WORK/said.txt" 2>&1
    grep -oE 'EACCES|"filesScanned": [0-9]+' "$WORK/said.txt" | head -1
}
report "the tool alone stops in a dot dir" "$(dot_tool)" "EACCES"
report "the tool reads a tree inside a dot dir whole, its own left out" "$(dot_tool --import "$TOOLS/ngdoctor-dot-dirs.mjs")" '"filesScanned": 4'
printf '%s' "$(pass_output 4)" > "$WORK/pass-out.json"
pass_green "the pass reads a tree inside a dot dir whole, its own left out" --pass-root "$DOTTED"
got="$(grep -oE 'oxlint 3 files, 1 package.json, 1 stylesheets' "$WORK/said.txt")"
report "the three lists of the pass leave its dot dir out" "$got" "oxlint 3 files, 1 package.json, 1 stylesheets"

# The pass whose fast-glob does not list by the given file system.
dot_tree
sed -i.bak "s/absolute: true, fs, /absolute: true, /" "$DOT/tools/check-ngdoctor-pass.mjs"
NO_FS="fast-glob does not list by the file system that skips the dot directories"
printf '%s' "$(pass_output 3)" > "$WORK/pass-out.json"
got="$(dot_says "$NO_FS" --input "$WORK/pass-out.json" --threshold "$WORK/pass-threshold.json" --pass-root "$PASS")"
report "a pass without the dot dir skip is red" "$got" "red, named"

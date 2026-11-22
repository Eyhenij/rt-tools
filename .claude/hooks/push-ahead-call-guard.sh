#!/usr/bin/env bash
# rt-kit v0.38.0 · hooks/push-ahead-call-guard.sh · 5e560e22be47 · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/deny-tail.sh, hooks/decide.sh
# Guard of the call of the run ahead: the exit code of the set stays visible.
#
# A call that runs `git-guard-push-ahead.sh` in the background comes back as a notice with the code
# of the LAST command of the call, not of the set. A red set followed by `; tail -5 log` or piped
# into `| tail` comes back as «exit code 0», and the session reads a red set as green or reads the
# log by hand. Most calls with a tail print `$?` of the set in the output, and the code is seen
# there; the guard refuses only a call whose code of the set is visible nowhere:
#   - `;`, a newline or `||` after the set, and the next command prints no `$?`;
#   - a pipe after the set without `PIPESTATUS` after it and without `set -o pipefail` before it;
#   - the set sent to the background by `&` or put under `!`;
#   - a chain of `&&` after the set that ends with `;` or a newline, and no `$?` after it.
# A set alone, a set with its own output redirected, a chain of `&&` to the end of the call, and
# `$?` right after the set pass. A text that only names the script — a search, a read, a heredoc,
# `printf` into a file, a quoted commit message, `bash -n` — passes; a run inside `bash -c '…'` is
# judged by its inner text.
#
# FAIL-OPEN: no `jq`, no `node`, a broken input, a call that is not a command, a command that does
# not name the script — pass. The price: in such an environment a hidden code goes through as
# before, and the session reads the verdict from the log.

RT_GUARD_NAME=push-ahead-call-guard
RT_GUARD_RULE=git-workflow

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
command -v node >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"
[ -z "$cmd" ] && exit 0
case "$cmd" in
    *git-guard-push-ahead.sh*) ;;
    *) exit 0 ;;
esac

# The judge reads the command as the shell splits it: quotes, heredoc bodies, comments, redirections
# and the separators between simple commands. It prints «pass» or «hide<TAB><what hides the code>».
verdict="$(RT_CALL="$cmd" node --input-type=module -e '
const SCRIPT = "git-guard-push-ahead.sh";
const SHELLS = new Set(["bash", "sh", "zsh"]);
const PREFIXES = new Set(["nohup", "exec", "command", "builtin"]);
const base = (w) => w.replace(/^.*\//, "");

// Heredoc bodies are text, not commands: they are cut before the split.
const dropHeredocs = (s) => {
    const lines = s.split("\n");
    const out = [];
    for (let i = 0; i < lines.length; i++) {
        out.push(lines[i]);
        const re = /(?<!<)<<(-?)\s*(["\x27]?)([A-Za-z_][\w.-]*)\2/g;
        let m;
        const ends = [];
        while ((m = re.exec(lines[i])) !== null) ends.push({ tabs: m[1] === "-", word: m[3] });
        for (const end of ends) {
            while (i + 1 < lines.length) {
                i++;
                const line = end.tabs ? lines[i].replace(/^\t+/, "") : lines[i];
                if (line === end.word) break;
            }
            out.push("");
        }
    }
    return out.join("\n");
};

const lex = (s) => {
    const toks = [];
    let word = null;
    let i = 0;
    const push = () => {
        if (word !== null) toks.push({ t: "w", v: word });
        word = null;
    };
    while (i < s.length) {
        const c = s[i];
        const rest = s.slice(i);
        if (c === "\\") {
            if (s[i + 1] === "\n") { i += 2; continue; }
            word = (word ?? "") + (s[i + 1] ?? "");
            i += 2;
            continue;
        }
        if (c === "\x27") {
            const j = s.indexOf("\x27", i + 1);
            const end = j < 0 ? s.length : j;
            word = (word ?? "") + s.slice(i + 1, end);
            i = end + 1;
            continue;
        }
        if (c === "\"") {
            let j = i + 1;
            let v = "";
            while (j < s.length && s[j] !== "\"") {
                if (s[j] === "\\" && j + 1 < s.length) { v += s[j + 1]; j += 2; } else { v += s[j]; j++; }
            }
            word = (word ?? "") + v;
            i = j + 1;
            continue;
        }
        if (c === "$" && s[i + 1] === "(") {
            let d = 0;
            let j = i + 1;
            for (; j < s.length; j++) {
                if (s[j] === "(") d++;
                else if (s[j] === ")" && --d === 0) break;
            }
            word = (word ?? "") + s.slice(i, j + 1);
            i = j + 1;
            continue;
        }
        if (c === "`") {
            const j = s.indexOf("`", i + 1);
            const end = j < 0 ? s.length : j;
            word = (word ?? "") + s.slice(i, end + 1);
            i = end + 1;
            continue;
        }
        if (c === "#" && word === null) {
            const j = s.indexOf("\n", i);
            i = j < 0 ? s.length : j;
            continue;
        }
        if (c === " " || c === "\t") { push(); i++; continue; }
        if (c === "\n") { push(); toks.push({ t: "op", v: ";" }); i++; continue; }
        const redir = (word === null || /^\d+$/.test(word)) && rest.match(/^(&>>|&>|>>|>&|<&|<<<|<<-?|<>|>\||>|<)(\d+|-)?/);
        if (redir) {
            const fd = word ?? "";
            word = null;
            const full = /&$/.test(redir[1]) && redir[2] !== undefined;
            toks.push({ t: "r", v: fd + redir[0], target: !full });
            i += redir[0].length;
            continue;
        }
        const op = rest.match(/^(&&|\|\||\|&|;;|\||;|&|\(|\))/);
        if (op) { push(); toks.push({ t: "op", v: op[1] }); i += op[1].length; continue; }
        word = (word ?? "") + c;
        i++;
    }
    push();
    return toks;
};

// Simple commands with the separator that follows each.
const commands = (toks) => {
    const list = [];
    let cur = { words: [], sep: null };
    let skipTarget = false;
    for (const tok of toks) {
        if (tok.t === "r") { skipTarget = tok.target; continue; }
        if (tok.t === "w") {
            if (skipTarget) { skipTarget = false; continue; }
            cur.words.push(tok.v);
            continue;
        }
        if (tok.v === "(" || tok.v === ")") continue;
        cur.sep = tok.v === ";;" ? ";" : tok.v;
        list.push(cur);
        cur = { words: [], sep: null };
    }
    list.push(cur);
    return list
        .map((c) => ({ ...c, words: c.words.filter((w, k) => !((w === "{" || w === "}") && k === 0) && w !== "}") }))
        .filter((c) => c.words.length > 0 || c.sep === "&" || c.sep === "|");
};

const shows = (c) => c !== undefined && c.words.some((w) => /\$\?|\$\{\?\}|PIPESTATUS/.test(w));

// Is the command a run of the set: the script itself, a shell running it, or a shell -c with a run.
const runOf = (c) => {
    let w = [...c.words];
    let neg = false;
    for (;;) {
        if (w[0] === "!") { neg = true; w = w.slice(1); continue; }
        if (w[0] !== undefined && /^[A-Za-z_][A-Za-z0-9_]*=/.test(w[0])) { w = w.slice(1); continue; }
        if (w[0] === "env") { w = w.slice(1); continue; }
        if (w[0] === "time") { w = w.slice(1); if (w[0] === "-p") w = w.slice(1); continue; }
        if (w[0] === "timeout") { w = w.slice(1); while (w[0]?.startsWith("-")) w = w.slice(1); w = w.slice(1); continue; }
        if (PREFIXES.has(w[0])) { w = w.slice(1); continue; }
        break;
    }
    if (w.length === 0) return null;
    if (base(w[0]) === SCRIPT) return { neg };
    if (!SHELLS.has(base(w[0]))) return null;
    let k = 1;
    let inner = null;
    let check = false;
    while (k < w.length && w[k].startsWith("-")) {
        if (/^-[a-z]*n/.test(w[k]) && !w[k].startsWith("--")) check = true;
        if (/^-[a-z]*c$/.test(w[k])) { inner = w[k + 1] ?? ""; break; }
        k++;
    }
    if (check) return null;
    if (inner !== null) {
        const v = judge(inner);
        if (v.hide) return { neg, hide: v.hide };
        return v.ran ? { neg } : null;
    }
    return w[k] !== undefined && base(w[k]) === SCRIPT ? { neg } : null;
};

const describe = {
    "!": "the set stands under `!`, and the call reports the opposite of its code",
    "&": "the set goes to the background by `&`, and the call ends before it",
    "|": "the set is piped into the next command with no `PIPESTATUS` and no `set -o pipefail`",
    ";": "`;` or a newline after the set, and the next command prints no `$?`",
    "||": "`||` after the set, and the next command prints no `$?`",
    "&&;": "a chain of `&&` after the set ends with `;` or a newline, and no `$?` follows",
};

function judge(text) {
    const cmds = commands(lex(dropHeredocs(text)));
    let ran = false;
    for (let k = 0; k < cmds.length; k++) {
        const run = runOf(cmds[k]);
        if (run === null) continue;
        if (run.hide) return { hide: run.hide, ran: true };
        ran = true;
        if (run.neg) return { hide: describe["!"], ran };
        const sep = cmds[k].sep;
        if (sep === null) continue;
        if (sep === "&") return { hide: describe["&"], ran };
        const before = cmds.slice(0, k).some((c) => c.words[0] === "set" && c.words.includes("pipefail"));
        const after = cmds.slice(k + 1);
        if (sep === "|" || sep === "|&") {
            if (before || after.some(shows)) continue;
            return { hide: describe["|"], ran };
        }
        if (sep === "&&") {
            let j = k + 1;
            while (j < cmds.length && ["&&", "|", "|&"].includes(cmds[j].sep)) j++;
            const end = cmds[j]?.sep ?? null;
            if (end === null) continue;
            if (end === "&") return { hide: describe["&"], ran };
            if (shows(cmds[j + 1]) || cmds[j + 1] === undefined) continue;
            return { hide: describe["&&;"], ran };
        }
        if (sep === ";" || sep === "||") {
            if (cmds[k + 1] === undefined || shows(cmds[k + 1])) continue;
            return { hide: describe[sep], ran };
        }
    }
    return { ran };
}

const v = judge(process.env.RT_CALL ?? "");
process.stdout.write(v.hide ? `hide\t${v.hide}` : "pass");
' 2>/dev/null)"

case "$verdict" in
    hide*) ;;
    *) exit 0 ;;
esac
tail_line="${verdict#hide	}"

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ahead_cmd="bash ${rt_hooks_dir#"$PWD"/}/git-guard-push-ahead.sh"
branch="$(git branch --show-current 2>/dev/null)"
log="\"\${TMPDIR:-/tmp}/push-ahead-${branch:-run}.log\""

# shellcheck disable=SC1091
. "$rt_hooks_dir/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 || exit 0
rt_decide push-ahead-call-guard.sh push_ahead_run '{"push_ahead_code_visible":"no"}' \
    "$(jq -cn --arg t "$tail_line" --arg c "$ahead_cmd" --arg l "$log" '{tail:$t, ahead_cmd:$c, log:$l}')" PreToolUse "$input"
exit 0

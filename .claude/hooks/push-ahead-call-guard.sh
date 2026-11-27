#!/usr/bin/env bash
# rt-kit v0.42.0 · hooks/push-ahead-call-guard.sh · f1e7419e0069 · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash
# Requires: hooks/deny-tail.sh, hooks/decide.sh
# Guard of the call of the run ahead: the notice of a background call carries the exit code of the
# set. Only a Bash call with `run_in_background` is judged: a call in the foreground returns its
# output in the result itself.
#
# A call that runs `git-guard-push-ahead.sh` in the background comes back as a notice with the code
# of the LAST command of the call, not of the set. A red set followed by `; echo "exit=$?"`,
# `; tail -5 log` or piped into `| tail` comes back as «exit code 0»: on 21.11 a session saw
# «exit=1» in the output and still read the notice «exit code 0» as green. A code printed into the
# output is no substitute for the code of the notice, so the guard refuses every call whose last
# command is not the set:
#   - any command after the set by `;`, a newline or `||`, unless it is `exit`, `exit $?`,
#     `rc=$?; …; exit $rc` at the end of the call, `|| exit N` with a nonzero N, or `set -e` stands
#     before the set;
#   - a pipe after the set, unless `set -o pipefail` stands before it and the pipe ends the call.
#     `exit ${PIPESTATUS[0]}` does not count: the calls of this host run in zsh, which has no such
#     array, and the exit is 0;
#   - the set sent to the background by `&`, put under `!` (except `if ! set; then exit N`) or run
#     inside `$(…)`;
#   - a chain of `&&` after the set that ends with `;`, a newline or `||` and no `exit $?` after it.
# A set alone, a set with its own output redirected and a chain of `&&` to the end of the call pass:
# on red each ends the call with the code of the set. A text that only names the script — a search,
# a read, a heredoc, `printf` into a file, a quoted commit message, `bash -n` — passes; a run inside
# `bash -c '…'` or `eval` is judged by its inner text. Loops and groups are read through: `done`,
# `fi` and `}` after the set pass its code on.
#
# FAIL-OPEN: no `jq`, no `node`, a broken input, a call that is not a command, a command that does
# not name the script — pass. The price: in such an environment a hidden code goes through as
# before. A script named only through a variable (`bash $S`) is not recognised.

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
[ "$tool" = Bash ] || exit 0
# Only a background call comes back as a notice with one exit code. A call in the foreground returns
# its output in the result itself, and a printed `exit=…` stands right there.
[ "$(printf '%s' "$input" | jq -r '.tool_input.run_in_background // false' 2>/dev/null)" = true ] || exit 0

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
// Words that only open a command: they pass the code of what follows them on.
const OPENERS = new Set(["nohup", "exec", "command", "builtin", "then", "else", "elif", "do", "if", "while", "until", "{"]);
// Words that close a loop or a group: the code of the set goes on through them.
const CLOSERS = new Set(["done", "fi", "esac", "}"]);
// `$?` inside double quotes is expanded by the shell that reads the quotes; the mark keeps that
// apart, so that an inner `bash -c "…; exit $?"` is read as the outer code it really is.
const OUTER = "\u0001";
const base = (w) => w.replace(/^.*\//, "");

const lex = (s) => {
    const toks = [];
    const heredocs = [];
    let word = null;
    let i = 0;
    const push = () => {
        if (word !== null) toks.push({ t: "w", v: word });
        word = null;
    };
    // The delimiter of a heredoc: quotes and backslashes are dropped, as the shell drops them.
    const delimiter = () => {
        while (s[i] === " " || s[i] === "\t") i++;
        let d = "";
        while (i < s.length && !/[\s;|&<>()]/.test(s[i])) {
            if (s[i] === "\x27" || s[i] === "\"") {
                const q = s[i];
                const j = s.indexOf(q, i + 1);
                const end = j < 0 ? s.length : j;
                d += s.slice(i + 1, end);
                i = end + 1;
                continue;
            }
            if (s[i] === "\\") { d += s[i + 1] ?? ""; i += 2; continue; }
            d += s[i++];
        }
        return d;
    };
    while (i < s.length) {
        const c = s[i];
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
                if (s[j] === "\\" && j + 1 < s.length) { v += s[j + 1]; j += 2; continue; }
                if (s[j] === "$" && s[j + 1] === "?") { v += OUTER; j += 2; continue; }
                v += s[j];
                j++;
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
        if (c === "\n") {
            push();
            toks.push({ t: "op", v: ";" });
            i++;
            // The bodies of the heredocs opened on this line are text, not commands.
            while (heredocs.length > 0) {
                const h = heredocs.shift();
                for (;;) {
                    const j = s.indexOf("\n", i);
                    const line = s.slice(i, j < 0 ? s.length : j);
                    i = j < 0 ? s.length : j + 1;
                    if ((h.tabs ? line.replace(/^\t+/, "") : line) === h.word) break;
                    h.body += line + "\n";
                    if (j < 0) break;
                }
            }
            continue;
        }
        // A redirection glued to a word ends that word: `set>log` is the set and its log.
        if ((c === ">" || c === "<" || (c === "&" && s[i + 1] === ">")) && word !== null && !/^\d+$/.test(word)) {
            push();
            continue;
        }
        const rest = s.slice(i);
        const redir = (word === null || /^\d+$/.test(word)) && rest.match(/^(&>>|&>|>>|>&|<&|<<<|<<-|<<|<>|>\||>|<)(\d+|-)?/);
        if (redir) {
            const fd = word ?? "";
            word = null;
            i += redir[0].length;
            if (redir[1] === "<<" || redir[1] === "<<-") {
                const h = { tabs: redir[1] === "<<-", word: delimiter(), body: "" };
                heredocs.push(h);
                toks.push({ t: "r", v: fd + redir[1], target: false, heredoc: h });
                continue;
            }
            const full = /&$/.test(redir[1]) && redir[2] !== undefined;
            toks.push({ t: "r", v: fd + redir[0], target: !full });
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
    let cur = { words: [], sep: null, heredocs: [] };
    let skipTarget = false;
    for (const tok of toks) {
        if (tok.t === "r") {
            skipTarget = tok.target;
            if (tok.heredoc) cur.heredocs.push(tok.heredoc);
            continue;
        }
        if (tok.t === "w") {
            if (skipTarget) { skipTarget = false; continue; }
            cur.words.push(tok.v);
            continue;
        }
        if (tok.v === "(" || tok.v === ")") continue;
        cur.sep = tok.v === ";;" ? ";" : tok.v;
        list.push(cur);
        cur = { words: [], sep: null, heredocs: [] };
    }
    list.push(cur);
    return list.filter((c) => c.words.length > 0 || c.sep === "&" || c.sep === "|");
};

const isStatus = (w) => w === "$?" || w === "${?}" || w === OUTER;
const isCloser = (c) => c !== undefined && c.words.length === 1 && CLOSERS.has(c.words[0]);
// The pipefail state the commands before the set leave: the last `set -o pipefail` or
// `set +o pipefail` wins.
const pipefailAfter = (list, start) => {
    let on = start;
    for (const c of list) {
        if (c.words[0] !== "set") continue;
        c.words.forEach((w, k) => {
            if (c.words[k + 1] !== "pipefail") return;
            if (/^-[a-zA-Z]*o$/.test(w)) on = true;
            if (/^\+[a-zA-Z]*o$/.test(w)) on = false;
        });
    }
    return on;
};
// The errexit state the commands before the set leave: `set -e`, `set -o errexit` and their `+`.
const errexitAfter = (list, start) => {
    let on = start;
    for (const c of list) {
        if (c.words[0] !== "set") continue;
        c.words.forEach((w, k) => {
            if (/^-[a-zA-Z]*o$/.test(w) && c.words[k + 1] === "errexit") on = true;
            else if (/^\+[a-zA-Z]*o$/.test(w) && c.words[k + 1] === "errexit") on = false;
            else if (/^-[a-zA-Z]*e/.test(w)) on = true;
            else if (/^\+[a-zA-Z]*e/.test(w)) on = false;
        });
    }
    return on;
};
// `exit N` with a nonzero number, after the words that only open a command: on red the call ends red.
const exitsRed = (c) => {
    if (c === undefined) return false;
    const w = c.words.filter((x, k) => !(k === 0 && (x === "then" || x === "{" || x === "else")));
    return w[0] === "exit" && /^[0-9]+$/.test(w[1] ?? "") && Number(w[1]) !== 0;
};
// A command substitution that runs the set keeps its code inside: the call never sees it.
const substitutes = (c) => c.words.some((w) => {
    for (const m of w.matchAll(/\$\(([\s\S]*)\)|`([^`]*)`/g)) {
        if (judge(m[1] ?? m[2] ?? "", false, false).ran) return true;
    }
    return false;
});

// Words before the command itself: assignments, `!`, `env`, `time`, `timeout`, `nice`,
// `caffeinate`, `pnpm exec`, `npx` and the words that only open a command.
const strip = (words) => {
    let w = [...words];
    let neg = false;
    const dropOptions = (withArg) => {
        while (w[0] !== undefined && w[0].startsWith("-")) {
            const o = w[0];
            w = w.slice(1);
            if (withArg.includes(o)) w = w.slice(1);
        }
    };
    for (;;) {
        const h = w[0];
        if (h === undefined) break;
        if (h === "!") { neg = true; w = w.slice(1); continue; }
        if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(h)) { w = w.slice(1); continue; }
        if (OPENERS.has(h)) { w = w.slice(1); dropOptions([]); continue; }
        if (base(h) === "env") { w = w.slice(1); dropOptions(["-u", "-C", "-S"]); continue; }
        if (h === "sudo") { w = w.slice(1); dropOptions(["-u", "-g", "-C"]); continue; }
        if (h === "stdbuf") { w = w.slice(1); dropOptions(["-i", "-o", "-e"]); continue; }
        if (h === "time") { w = w.slice(1); dropOptions([]); continue; }
        if (h === "timeout") { w = w.slice(1); dropOptions(["-s", "-k"]); w = w.slice(1); continue; }
        if (h === "nice") { w = w.slice(1); dropOptions(["-n"]); continue; }
        if (h === "caffeinate") { w = w.slice(1); dropOptions(["-t", "-w"]); continue; }
        if (base(h) === "script") { w = w.slice(1); dropOptions(["-F", "-t"]); w = w.slice(1); continue; }
        if (h === "npx") { w = w.slice(1); dropOptions([]); continue; }
        if ((h === "pnpm" || h === "npm") && w[1] === "exec") { w = w.slice(2); dropOptions([]); continue; }
        break;
    }
    return { w, neg };
};

// Is the command a run of the set: the script itself, a shell running it, `source`, or a shell -c
// or `eval` whose inner text holds a run.
const runOf = (c) => {
    const { w, neg } = strip(c.words);
    if (w.length === 0) return null;
    if (base(w[0]) === SCRIPT) return { neg };
    if ((w[0] === "source" || w[0] === ".") && w[1] !== undefined && base(w[1]) === SCRIPT) return { neg };
    const inner = (text, pipefail, errexit) => {
        const v = judge(text.split(OUTER).join("0"), pipefail, errexit);
        if (v.hide) return { neg, hide: v.hide };
        return v.ran ? { neg } : null;
    };
    if (w[0] === "eval") return inner(w.slice(1).join(" "), false, false);
    if (!SHELLS.has(base(w[0]))) return null;
    let k = 1;
    let check = false;
    let hasC = false;
    let pipefail = false;
    let errexit = false;
    while (k < w.length && /^[-+]/.test(w[k])) {
        const o = w[k];
        if (o.startsWith("--")) {
            k += o === "--rcfile" || o === "--init-file" ? 2 : 1;
            continue;
        }
        const letters = o.slice(1);
        if (o[0] === "-" && letters.includes("n")) check = true;
        if (letters.includes("c")) hasC = true;
        if (o[0] === "-" && /^[a-zA-Z]*e/.test(letters) && !/[oO]$/.test(letters.split("e")[0])) errexit = true;
        if (/[oO]$/.test(letters)) {
            if (o[0] === "-" && w[k + 1] === "pipefail") pipefail = true;
            if (o[0] === "-" && w[k + 1] === "errexit") errexit = true;
            k += 2;
            continue;
        }
        k++;
    }
    if (check) return null;
    if (hasC) return inner(w[k] ?? "", pipefail, errexit);
    // A shell with no script and no `-c` reads its commands from a heredoc.
    if (w[k] === undefined && c.heredocs.length > 0) return inner(c.heredocs.map((h) => h.body).join("\n"), pipefail, errexit);
    return w[k] !== undefined && base(w[k]) === SCRIPT ? { neg } : null;
};

const describe = {
    "!": "the set stands under `!`, and the call reports the opposite of its code",
    "&": "the set goes to the background by `&`, and the call ends before it",
    "|": "the set is piped into the next command, and the call does not end with that pipe under `set -o pipefail`",
    "$(": "the set runs inside a command substitution `$(…)`, and its code stays inside",
    ";": "a command follows the set by `;` or a newline, and the call ends with the code of that command",
    "||": "a command follows the set by `||`, and on red the call ends with the code of that command",
    "&&;": "a chain of `&&` after the set ends with `;`, a newline or `||`, and no `exit $?` follows it",
};

function judge(text, pipefailAtStart, errexitAtStart) {
    const cmds = commands(lex(text));
    const last = cmds[cmds.length - 1];
    const exitsWith = (c, accept) => c !== undefined && c.words[0] === "exit" && (c.words.length === 1 || accept(c.words[1]));
    const endsWithExit = (c) => exitsWith(c, isStatus);
    // The `then` branch from `start` runs its commands by `;` and reaches `exit N` before `fi`.
    const thenExitsRed = (start) => {
        for (let j = start; cmds[j] !== undefined; j++) {
            const w0 = cmds[j].words[0];
            if (j > start && (w0 === "fi" || w0 === "else" || w0 === "elif")) return false;
            if (exitsRed(cmds[j])) return true;
            if (cmds[j].sep !== ";") return false;
        }
        return false;
    };
    let ran = false;
    for (let k = 0; k < cmds.length; k++) {
        if (substitutes(cmds[k])) return { hide: describe["$("], ran: true };
        const run = runOf(cmds[k]);
        if (run === null) continue;
        if (run.hide) return { hide: run.hide, ran: true };
        ran = true;
        // `if ! set; then exit 1; fi`: on red the call ends red.
        const head = cmds[k].words[0];
        if (run.neg && (head === "if" || head === "elif") && cmds[k].sep === ";" && cmds[k + 1]?.words[0] === "then" && thenExitsRed(k + 1)) continue;
        if (run.neg) return { hide: describe["!"], ran };
        // Loops and groups closing after the set pass its code on.
        let sep = cmds[k].sep;
        let i = k + 1;
        while ((sep === ";" || sep === "\n") && isCloser(cmds[i])) { sep = cmds[i].sep; i++; }
        if (sep === null) continue;
        if (sep === "&") return { hide: describe["&"], ran };
        if ((sep === ";" || sep === "||") && cmds[i] === undefined) continue;
        // `set || exit 1`: on red the call ends red, whatever follows on green.
        if (sep === "||" && exitsRed(cmds[i])) continue;
        // Under errexit a red set ends the call with its own code, unless it is a condition.
        const condition = ["if", "elif", "while", "until"].includes(head);
        if (sep === ";" && !condition && errexitAfter(cmds.slice(0, k), errexitAtStart)) continue;
        if (sep === "|" || sep === "|&") {
            let m = i;
            while (cmds[m] !== undefined && ["|", "|&"].includes(cmds[m].sep)) m++;
            // `PIPESTATUS` is no help: the calls of this host run in zsh, where the array is absent
            // and `exit ${PIPESTATUS[0]}` exits with 0. Only pipefail carries a red set out.
            const pipefail = pipefailAfter(cmds.slice(0, k), pipefailAtStart);
            const end = cmds[m]?.sep ?? null;
            if (pipefail && end !== "&" && end !== "||" && end !== "&&" && (cmds[m + 1] === undefined || endsWithExit(cmds[m + 1]))) continue;
            return { hide: describe["|"], ran };
        }
        if (sep === "&&") {
            let m = i;
            while (cmds[m] !== undefined && ["&&", "|", "|&"].includes(cmds[m].sep)) m++;
            let end = cmds[m]?.sep ?? null;
            // `set && break; done` in a retry loop: the loop ends with the code of the last set.
            while ((end === ";" || end === "\n") && isCloser(cmds[m + 1])) { m++; end = cmds[m].sep; }
            if (end === "&") return { hide: describe["&"], ran };
            if (end === null || cmds[m + 1] === undefined) continue;
            if (endsWithExit(cmds[m + 1])) continue;
            return { hide: describe["&&;"], ran };
        }
        // `;`, a newline or `||`: only `exit`, `exit $?`, or `rc=$?` and `exit $rc` at the end.
        const next = cmds[i];
        if (endsWithExit(next)) continue;
        const saved = next.words.length === 1 ? next.words[0].match(/^([A-Za-z_][A-Za-z0-9_]*)=(\$\?|\$\{\?\}|\u0001)$/) : null;
        // `exit $rc` counts only as the last command, reached unconditionally after a `;`.
        const before = cmds[cmds.length - 2];
        if (saved && next !== last && before?.sep === ";" && exitsWith(last, (a) => a === "$" + saved[1] || a === "${" + saved[1] + "}")) continue;
        return { hide: describe[sep === "||" ? "||" : ";"], ran };
    }
    return { ran };
}

const v = judge(process.env.RT_CALL ?? "", false, false);
process.stdout.write(v.hide ? `hide\t${v.hide}` : "pass");
' 2>/dev/null)"

case "$verdict" in
    hide*) ;;
    *) exit 0 ;;
esac
tail_line="${verdict#hide	}"

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ahead_cmd="bash ${rt_hooks_dir#"$PWD"/}/git-guard-push-ahead.sh"
# The log lies outside the working copy and is named by it: two copies running ahead at once do not
# write over each other, and a branch name with `/` makes no missing directory.
log='"${TMPDIR:-/tmp}/push-ahead-$(basename "$PWD").log"'

# shellcheck disable=SC1091
. "$rt_hooks_dir/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 || exit 0
rt_decide push-ahead-call-guard.sh push_ahead_run '{"push_ahead_code_visible":"no"}' \
    "$(jq -cn --arg t "$tail_line" --arg c "$ahead_cmd" --arg l "$log" '{tail:$t, ahead_cmd:$c, log:$l}')" PreToolUse "$input"
exit 0

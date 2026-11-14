/**
 * The read recorder of a shell started by a push set step. `push-inputs.mjs` loads `BASH_RECORDER`
 * into every non-interactive bash by `BASH_ENV` while it records the table, and reads the lines
 * back by `shellLine`.
 *
 * A file of its own because the shell is read by rules unlike those of `node`: the record of a node
 * process names its reads itself, a shell line has to be taken apart word by word.
 *
 * FAIL-OPEN: without `RT_PUSH_TRACE_OUT` the recorder sets nothing, and a bash without the hooks of
 * `BASH_ENV` leaves no lines — its start stays unseen and the step runs on every change.
 */
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * A trap before each simple command writes the start mark, the file of the line, the working
 * directory and the command. A command free of `$(`, backticks and redirections is written with its
 * words expanded by the shell itself, joined by the unit separator; any other is written as it
 * stands. The step's own streams are not touched: the system bash of the machine has no descriptor
 * of its own for a trace.
 */
export const BASH_RECORDER = `if [ -n "$RT_PUSH_TRACE_OUT" ]; then
    set -T
    trap '__rt_c="$BASH_COMMAND"; case "$__rt_c" in *"\\$("*|*"\\\`"*|*"<"*|*">"*) __rt_e="$__rt_c" ;; *) __rt_e="$(eval "printf \\"%s\\\\037\\" $__rt_c" 2>/dev/null)" || __rt_e="$__rt_c" ;; esac; printf "%s\\t%s\\t%s\\t%s\\n" "\${RT_PUSH_TRACE_SPAWN:-}" "\${BASH_SOURCE[0]:-}" "$PWD" "$__rt_e" >> "$RT_PUSH_TRACE_OUT/bash-$$.trace"' DEBUG
fi
`;

/**
 * Whether a shell text reads by an input redirection. The trap sees simple commands only, and a
 * redirection on a loop or a block — `done < "$file"` — stands on no command it sees. The text is
 * read without comments and with quoted strings emptied: a `<` inside a printed line is no input.
 */
export function redirectsInput(text) {
    const bare = text
        .replace(/'[^']*'/g, "''")
        .replace(/"(?:[^"\\]|\\.)*"/g, '""')
        .replace(/(^|\s)#.*$/gm, '$1');
    return /(^|[^<\d&])<\s*(""|[$\w./~-])/m.test(bare);
}

/**
 * What one traced shell line reads: the file the line stands in, and every word of an expanded
 * command that names a path of the tree — a file read, a directory listed, a missing path probed. A
 * git call is judged by the caller's `gitKind`. A word left unexpanded is unseen, and a redirection
 * is named untraced: its target is no word of the command.
 */
export function shellLine(line, sink, { root, inside, rel, gitKind }) {
    const [, source, pwd, command = ''] = line.split('\t');
    if (source && inside(source)) sink.reads.add(rel(source));
    const expanded = command.includes('\x1f');
    const words = (expanded ? command.split('\x1f') : command.split(/\s+/)).filter(Boolean);
    if (!expanded && redirectsInput(command)) sink.kinds.add('untraced:bash <');
    if (words[0] === 'git') {
        [gitKind({ cwd: pwd || root, command: words })].flat().forEach((k) => sink.kinds.add(k));
        return;
    }
    for (const word of words) {
        // A word with a blank, a pattern sign or a pipe is a printed line, not a path.
        if (/[$\s|*?"'\\]/.test(word) || /^\w+=/.test(word) || !(word.includes('/') || /\.\w+$/.test(word))) continue;
        const path = resolve(pwd || root, word);
        if (!inside(path)) continue;
        if (!existsSync(path)) sink.probes.add(rel(path));
        else if (statSync(path).isDirectory()) sink.walks.add(rel(path));
        else sink.reads.add(rel(path));
    }
}

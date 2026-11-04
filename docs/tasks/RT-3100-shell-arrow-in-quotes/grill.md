# Grill

## The owner request

> RT-3100 (Рекомендуется)

The owner picked it from three described tasks; the other options were RT-3095 (the dispatcher glues
the output of several guards) and RT-3084 (one icon input in the second kit). The task body: the
helper that finds write targets in a command takes `>` inside quotes for a redirection, so
`echo "a->b"` and `node -e "[1].map(x => x)"` read as writes and are refused as edits. The exam
guard's refusal also loses a path: backquotes inside a double-quoted string run as a command.

## What is already in the tree

- `projects/agent-kit/assets/hooks/write-targets.sh:rt_write_targets` — the shell part runs
  `tr` over all quotes, then `sed 's/>>?/\n>/g'`; the interpreter bodies are parsed apart from the
  raw text.
- `projects/agent-kit/assets/hooks/exam-guard.sh` — the refusal names `.claude/rt-kit.json` in
  backquotes inside `deny "…"`.
- The suite is `projects/agent-kit/tests/shell-write-paths.test.sh`; the spec is
  `docs/specs/agent-kit/edit-place/` (263 scenario lines).

## Questions and answers

Closed by assumption, as the tasks before it:

- **Does the task change the behaviour** — yes, of two package guards; no application code.
- **Does it need an edit of a law or a rule** — no: one spec rule.
- **One task or several** — one: both defects are in the same pair of guards.
- **What is not part of the task** — the interpreter-body parse.
- **What shows the task is closed** — scenarios: an arrow inside quotes gives no write target,
  `echo x > out` still gives `out`; the exam refusal carries the path.
- **The sample** — the heredoc cut-out next to it, an awk stage over the shell text.

## Decisions

- **The quoted `>` is dropped before the quotes are blanked.** An awk stage walks each line by
  characters, keeps the quote state, honours `\` outside single quotes and resets on a new line.
- **The path in the exam refusal goes in « ».** The tree's refusals quote names that way already.

# Guards the task delivery loop meets

Part of [SKILL.md](SKILL.md). What refuses along the loop and what to do instead of a second try.

## Rules gate

- **After a context compaction the gate forgets every loaded rule.** Each rule is loaded again by
  the Skill tool, and its `implementation.md` is read as a file.
- **The gate demands this skill on an edit of a task folder or an epic plan and on the delivery
  commands** — `task:new`, a branch taken by `checkout -b`, `switch -c`, `worktree add -b` or
  `git branch <name>`, a push and `gh pr create`. A mention of these words in a read command demands
  it too: one load, on purpose. Loaded first, it never refuses there.

## Questions to the owner

- **A question whose answer is written somewhere is refused.** Search the documents first and ask
  only what they leave open.
- **Two menus in a row answered with the recommended option close the next question.** The
  remaining choice becomes an assumption written into the grill and is named in one line.
- **A session started by another session asks that session, not the owner.**

## Branches and the push

- **A branch of a working copy without a row in the assignment table is refused.** The copy names
  itself in `.claude/rt-kit/tree-name`, and the row goes into `.claude/rt-kit/assignments.md`.
- **The run ahead writes marks only for a clean copy.** Commit first, then run it; a touch of the
  tree after a green run drops the marks.
- **A visible kit edit is refused at the push without both approvals** — the rule `kit-approval`.

## End of the turn

- **A turn with unpushed commits is refused.** Push, or name the reason by the line «Не отправлено:».
- **A taken task does not end a turn.** The guard names the first stage.

## Opening the PR

- **The PR opens by `gh pr create` typed in full, never through a variable and never by a REST
  call to the pulls endpoint.** The delivery guards read only that command text. The one exception
  is the query quota refusal of pattern `git-workflow-pr-body`: then REST opens the PR, and the
  guard's list is checked by hand first.
- **A refusal of `gh pr create` names everything unmet at once:** the folder, the merge of the
  base, the title, the card in the first column, the `Closes` line, the sections «Точки», «Цель»
  and «Оставшийся шаг», a draft into a base the pipeline does not wake for, and a token whose
  account equals the reviewer. It is fixed, never bypassed by REST.
- **The delivery guards read a delivery word anywhere in the command text.** A script or a probe
  that only mentions `gh pr create` is judged as the call itself: such text goes into a file.

<!-- rt-kit v0.42.1 · pitfalls/git-workflow-pr.github.md · 570ab93e66a1 · правится надстройкой, не здесь -->
# The PR — cold part

The pattern `git-workflow-pr` whole, in two files: every section with its code and its reasons. Its hot part names the sections and the opening of each.

## Pitfalls

The misses of this pattern stand where they happen: in its sections below and in its list of
common misses, when it has one.

Pattern of the rule `git-workflow`. What must be true — the law
`docs/constitution/delivery.md`. Creating the task, the branch and the commit — pattern
`git-workflow-commit`.

## When to use

- A PR is opened from a finished branch.
- The title, body or labels of an already open PR are edited.
- The draft is lifted, and the work is handed over for review.
- The PR state is read before anything is said about it to the owner.

## The task number stands in its title and in the PR title

One form for both — `[<КЛЮЧ>-<номер>] <текст>`. The number stands in the title itself, not only
in the body: the PR list shows no bodies, and in the task list the number otherwise has to be
found by eye in the left column. The branch name carries the same number —
`<КЛЮЧ>-<номер>-<короткий-slug>` — so task, branch and PR read as one.

The task says what is wrong; the PR, under the same number, says what was done:

```
задача  [<КЛЮЧ>-86] Пустой MAIL_OWNER — письма владельцу не уходят молча
PR      [<КЛЮЧ>-86] Письмо владельцу с незаполненным адресом попадает в логи

задача  [<КЛЮЧ>-101] Вернуть оверлей загрузки таблицы и включить stylelint гейтом
PR      [<КЛЮЧ>-101] Stylelint включён гейтом

задача  [<КЛЮЧ>-212] Сайт не собирается: компонентам кита проставлен префикс приложения вместо своего
PR      [<КЛЮЧ>-212] Виджет переписки зовёт кит его собственными именами
```

The infinitive of the task does not carry into the PR title: "fix" becomes "fixed", "restore" —
"restored", "add" — "added".

The number in the title must match the branch number: the delivery guard checks them before the
command is sent, and the queue audit — on every open PR.

Type and scope — `fix(site):`, `docs(common):` — do not go into the PR title: that is the commit
subject format, and `commitlint` checks it there. In the PR list it takes room and adds nothing:
the kind of edit and the area are already visible by the labels.

## A draft where a run is waited for, ready where it is not

A code edit is handed to a person by an open PR: a pushed branch is shown to them nowhere. An
open PR reads as an invitation to merge, so unfinished work opens it as a draft — the host locks
a draft's merge button itself.

**Which bases the pipeline wakes for is read from its file, not from memory.** That one line decides
which of the two orders applies, and taking the wrong one means either waiting for a run that never
comes or handing over unchecked work as finished:

```bash
# the bases the checks wake for; nothing printed means every base
sed -n '/^on:/,/^[a-z]/p' .github/workflows/<файл конвейера>
```

A base the pipeline wakes for — the PR opens as a draft, and the draft is lifted on the green run:

```bash
GH_TOKEN="$TOKEN" gh pr create --draft --base <ветка эпика> --title '[<КЛЮЧ>-86] …' --body-file тело.md
```

A base it does not wake for — nothing to wait for, and the PR opens without the draft key. The push
gate is then the only blocking check behind the work, green before the branch is sent:

```bash
GH_TOKEN="$TOKEN" gh pr create --base <ветка эпика> --title '[<КЛЮЧ>-86] …' --body-file тело.md
```

**The base is the epic branch, and it is named by the command.** Without `--base` the host takes
the repository's default branch: the request then carries the task past the epic, and the epic
branch stays a copy nobody merges. The epic's own request is the only one based on the main branch,
and it opens when the last folder of its tasks is taken apart.

Before `gh pr create --base <ветка>` the base is checked on the host by `git ls-remote --heads origin
<ветка>`. An empty answer means the base was merged and removed: the request then takes the next
branch up the chain as its base, not the removed one. The host may keep a merged branch, and then
`git ls-remote` does not show the merge: the base is asked by
`gh pr list --head <base> --state merged` right before the opening call.

Everything waiting for a pipeline run, a rework or an answer goes as a draft, and the question is
asked in the PR itself: a person reads the PR, not the session's conversation.

The draft is lifted by a separate call, and that is the very turn in which the executor says the
solution is ready:

```bash
GH_TOKEN="$TOKEN" gh pr ready 86
```

Before the lifting the executor's silence means "not ready yet", after — "may be merged".
Lifting the draft and asking to merge go in one turn: a lifted draft nobody told the person about
waits for review just like one not lifted. A PR opened without the draft key needs no such call,
and the request to merge goes in the turn that opened it.

## The link to the task and the body

The `Closes #<номер>` line, the reviewer, the assignee and the labels set by the opening call,
the six sections of the body and how the task closes when the base is not the main branch —
pattern `git-workflow-pr-body`. The pattern was split out of this one by the length limit.

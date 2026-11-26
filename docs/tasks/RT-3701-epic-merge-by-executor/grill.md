# Grill

**Behaviour:** unchanged — правятся правило поставки пакета правил и хук слияния, код приложения не трогается

## The owner request

> Изучи досконально task flow и вынеси в предложение, что можно уменьшить по ресурсам и времени… Свести
> несколько подтверждений в одно со стороны человека, либо еще как-то другими способами ускорить процесс
> разработки и уменьшить количество обращений к человеку.

The card RT-3701 is proposal П3 of the epic RT-3693, approved by the owner on 26.11 in one window
together with the plan of RT-3695. In the window of the plan of RT-3696 the owner gave the word for
this epic: «Сливай задачи RT-3693 сам (Recommended)». On 26.11, after the host signed the merge of
PR #3708 by the private email of the machine account, the owner chose in a window: «Переписать и
force push (Recommended)» — the epic branch was rewritten with the merge signed by the noreply email,
and later tasks of the epic merge by a local merge, not by the host's button.

## What the tree already has

- The law `delivery` already lets the executor merge on a word named in advance; the rule
  `git-workflow-hosting` says «The executor merges only on a person's word — about this PR or a named
  allowance — by `gh pr merge <номер>` with `--merge` or the tree's form». Its companion marks the
  article «Not checked by anything».
- `task-delivery-loop` says «The executor merges only by the owner's word.»
- The hook `git-guard-delivery.sh` on `gh pr merge` checks the run on the tip
  (`git-guard-delivery-merge.sh:rt_delivery_merge_run`; a PR into an epic branch has no run and passes)
  and the task folder. It does not look at the base: the executor's `gh pr merge` into main passes too.
- `gh pr merge` signs the merge commit by the primary email of the account that merges. For the
  machine account it is a private address, and the signature hook of this tree refuses it at the next
  push of the epic branch (`dd28df026`, 26.11).
- The epic plan `docs/plans/owner-touches.md` holds П3 and the owner's decision on it; the word
  «Сливай задачи RT-3693 сам» is not written there yet.

## What the rules already say

The allowance named in advance is lawful; what is missing is its record, the form of the merge that
keeps the signature declared, and a refusal of the executor's merge into main.

**Tasks of the grill:** 1

## Questions and answers

No question went to the owner: the card and the two window answers close the six.

- **Does the task change the application's behaviour** — closed by the card: no application code.
- **Does it need an edit of a law or a rule** — closed by exploration: no law; the rule
  `git-workflow-hosting` and the loop `task-delivery-loop` name the allowance and the form.
- **One task or several** — closed by the card: one.
- **What is not part of the task** — closed by assumption: the merge of the epic into main stays the
  owner's; the bot account's email setting on the host is the owner's.
- **What will show that the task is closed** — closed by the card: the word is written; the rule and
  the hooks let the executor merge a task into the epic branch and refuse a merge into main.
- **Is there a sample** — closed by exploration: the refusal pieces of `git-guard-delivery.sh`.

## Decisions

- **A task PR goes into the epic branch by `gh pr merge <номер> --merge --author-email <noreply-адрес
  машинной учётной записи>`** — the client names the author of the merge commit, and the signature
  stays declared. Rejected: a local merge pushed by hand — a second road past the host's merge state;
  `gh pr merge` without the key — the host signs by the account's private email.
- **The delivery guard refuses the executor's `gh pr merge` whose base is the main branch, and one
  without the noreply author email.** The merge into main stays the owner's button. Rejected: a check
  of the base only — the host's merge would still sign the epic branch by the private email.

## What is left unclear

- Nothing blocks the work: the committer of a host merge is the host itself, which the signature hook
  already accepts on the main branch.

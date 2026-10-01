# Grill

## The owner request

The task on the board, #2451:

> Гард пуша отбивает вызов «из второй рабочей копии», если папка из `cd` лежит в другом корне, чем
> папка сессии. Корень чужого репозитория не совпадает с корнем сессии всегда. Поэтому сессия,
> запущенная в дереве-потребителе, не может отправить ветку в репозиторий пакета: гард принимает
> его за вторую копию своего дерева.
>
> Второй копией считать только папку с тем же общим каталогом `.git` и другим корнем. Вызов в
> чужом репозитории этот гард не судит.

The owner's order in the session:

> Рядом тот же род ошибки у гарда поставки: при создании ветки RT-2451 из сессии потребителя он
> искал задачу #2451 в репозитории потребителя. Ключ задач и репозиторий нужно брать у дерева, в
> котором выполняется команда. Сам реши, входит ли это в RT-2451 или нужна отдельная задача.
> Решение запиши с доводом.
>
> Для обоих случаев нужны сценарий в спеке и тест: вторая копия того же репозитория по-прежнему
> отбивается, чужой репозиторий проходит. Затем отправка, PR в main от rt-tools-dev с ревьювером
> Eyhenij и перевод в in-review.
>
> PR сливает владелец. Когда обе задачи влиты, запусти workflow publish-agent-kit.yml через
> workflow_dispatch с version=patch. Убедись, что в реестре появилась 0.29.2, и назови владельцу
> номер версии.

## What the tree already has

- `docs/specs/agent-kit/delivery-tree/` — the subdomain "the tree a command runs in", scenarios
  SC-AK-1074 to SC-AK-1078. Its decision: the task state is asked of the work queue of the session
  tree. This work reverses that decision.
- `projects/agent-kit/assets/hooks/git-guard-push-tests.sh` compares the two roots, not the shared
  `.git` directory.
- `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh` judges only the branch name form by
  the tree of execution.
- `projects/agent-kit/assets/hooks/git-guard-delivery.sh` asks the task state from the session root.
- The test of SC-AK-1077 builds the "second copy" as a separate repository. After the fix it has to
  build a real second copy with `git worktree add`.

## Questions and answers

All closed by assumption: the answers are in the order and in the task body.

- The work changes behaviour — of two package guards. The agreement goes straight into the spec of
  the subdomain `delivery-tree`.
- No law is edited. The line of the rule `git-workflow` about the branch name form stays true.
- What is not part of the work is listed in the plan.
- What shows the task is closed is listed in the task body and in the order.

## Decisions

- **The delivery guard goes into RT-2451, no separate task.** Both refusals have one cause: the
  guard looks at the session tree, not at the tree the command runs in. One sign fixes both — the
  shared `.git` directory — and both fixes leave in one package release. A separate task would be
  a second branch with the same sign and the same release. Rejected: a task per guard.
- **A second copy is a directory with the same shared `.git` directory and another root, for both
  guards.** The delivery guard judges a second copy of the same repository by the profile and the
  board of the session tree, as before. Another repository is judged by its own profile, and
  without a profile is not judged.

## What is left unclear

- "When both tasks are merged" — the order does not name the second task. The neighbouring open
  package task is RT-2450. The release waits for both to be merged.

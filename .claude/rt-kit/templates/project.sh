#!/usr/bin/env bash
# rt-kit v0.25.0 · templates/project.sh · 8ccfe107787d · правится надстройкой, не здесь
# Tree profile override: the commands, stands and "edit — document" pairs of this repository.
#
# Copy to `.claude/rt-kit/project.sh` and add your own. The file is optional: without it the
# package default applies — `.claude/rt-kit/defaults/project.sh`, where the runner is chosen by
# the lockfile, and the linters, the branch name form and the reinvention samples are already named.
#
# Every function may stay silent. Silence means "there is no rule for this", and the hook lets it
# through. A function declared here replaces the default IN FULL — to add rather than replace,
# call the same name with the `_default` suffix from inside it.

# Where the applications are up. Goes into the refusal text when someone raises a second instance.
# The default is silent: naming a foreign port is worse than naming none.
RT_STANDS='<приложение> http://localhost:<порт>, <приложение> http://localhost:<порт>'

# Address of the production storage. Any write to it is refused outright, and the opt-out does not apply.
RT_PROD_DSN='<хост боевого хранилища>'

# Paths where an anchor for end-to-end tests is not required.
RT_QA_SKIP_RE='<выражение путей>'

# Name of the hosting client in the launch line: by it the restart guard recognises a restart
# call of the task. The package default is for the most widespread kind of hosting.
RT_HOST_CLI='<имя клиента хостинга>'

# Commands that must pass before a push. One per line; the first that fails refuses the push.
#
# A heavy step — a stand, showcase snapshots, image builds — is printed only when the branch
# touched more than texts: otherwise pushing a commit with one edited markdown line takes minutes,
# and the owner reads it as hung. The sign is given by `rt_push_docs_only <base>`; with an empty
# base it stays silent, and the whole set is run — the suite completeness audit calls this
# function with the same empty base, and it must see the list in full.
rt_push_checks() {
    rt_push_checks_default
    # printf '%s\n' '<своя проверка>'

    # Heavy steps — by the content of the edit, not always.
    # if [ -n "$1" ] && rt_push_docs_only "$1"; then
    #     return 0
    # fi
    # printf '%s\n' '<шаг, поднимающий стенд или собирающий образ>'
}

# Which document must go in the same commit as this file. Prints a path sample or stays silent.
rt_docs_pair_for() {
    case "$1" in
        # <свой путь>) printf '%s' '<образец пути документа>' ; return 0 ;;
        *) ;;
    esac

    rt_docs_pair_for_default "$1"
}

# What lints this file right after an edit. Prints a command or stays silent.
rt_lint_for() {
    rt_lint_for_default "$1"
}

# Name of a branch from which a PR may be opened. Success — it is fine.
rt_task_branch_ok() {
    rt_task_branch_ok_default "$1"
}

# What counts as reinvention in this tree. By line "sample<tab>what to replace it with".
rt_reinvented_in() {
    rt_reinvented_in_default "$1"
    # case "$1" in
    #     *.ts) printf '%s\t%s\n' '<образец>' '<чем заменить>' ;;
    # esac
}

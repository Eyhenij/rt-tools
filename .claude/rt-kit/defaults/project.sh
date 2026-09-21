#!/usr/bin/env bash
# rt-kit v0.29.0 · defaults/project.sh · af1535b1ccbe · правится надстройкой, не здесь
# Tree profile: what checks an edit here and what counts as reinvention.
#
# The package default. Everything the trees of this workshop have in common lives here: the Nx
# runner, the code linter, the style linter, the set of reinvention samples. A tree adds its own by
# an override — `.claude/rt-kit/project.sh`: it loads second, declares the same function anew and
# may call the same one from here with the `_default` suffix.
#
# Every function may stay silent. Silence means "there is no rule for this", and the hook lets it
# through.

# The package runner — by the lockfile, not by agreement: trees with pnpm and with npm lie in one
# workshop, and an `npm` hardwired here would, in the first of them, print a command that does not
# exist.
rt_runner() {
    root="${CLAUDE_PROJECT_DIR:-.}"
    if [ -f "$root/pnpm-lock.yaml" ]; then
        printf '%s' 'pnpm exec'
    elif [ -f "$root/yarn.lock" ]; then
        printf '%s' 'yarn'
    else
        printf '%s' 'npx'
    fi
}

# Where the applications are up. Goes into the refusal text when someone raises a second instance.
# Ports differ from tree to tree, so the default stays silent: naming someone else's port is worse
# than naming none.
RT_STANDS="${RT_STANDS:-}"

# Who raises those stands. `owner` — the tree's own applications are up and any raise is refused;
# `session` — nobody raises them here but the session, and only a raise over a taken port is
# refused. The default is silent, and the guard reads silence as `owner`: a tree that sets nothing
# keeps the behaviour it has today.
RT_STANDS_RAISED_BY="${RT_STANDS_RAISED_BY:-}"

# Where the tree's checks and the scenario set of its guards lie. A check the tree does not have is
# not called by the push gate: the list is printed from what lies on disk.
RT_CHECKS_DIR="${RT_CHECKS_DIR:-tools}"
RT_HOOKS_TESTS="${RT_HOOKS_TESTS:-.claude/hooks/tests/run.sh}"

# The commands that must pass before a push. One per line; the first one that fails refuses the
# push. The style linter on a separate line: the code linter does not read style files at all.
#
# The first parameter is the base: the branch against which the contribution is counted. Empty means
# there is no remote, and then everything runs: a set stricter than needed is safe, a set narrower
# than needed is not.
#
# The build runs alongside the lint and the specs. The linter does not read types, and the specs
# read only what someone brought into them by an import: a type error in uncovered code lives until
# the image build, that is, until the merge. It costs little — beyond that the runner cache works.
#
# A newly created check goes here, not only into the general run that nobody calls by themselves. A
# new line in its list of known cases leaves for the main branch silently, while the list is read as
# a working guard.
#
# The layout audit goes as the first line, for two reasons. It costs seconds, so it refuses before
# the long run begins. And before it, a drift of the laid-out copy from the package refused nothing.
# An edit put into the laid-out copy past the source breaks nothing on the day it is made, and
# surfaces on someone else's work: the layout refuses on the whole edited file and lays down not one
# other. The sign is the layout settings themselves: a tree without them does not install the
# package, and there is nothing to call in it.
#
# Whether the branch touched only texts. Zero code — only texts, otherwise — code.
#
# The sign is needed by the tree that added a heavy step to the gate set: a stand, showcase
# snapshots, image builds. Without it such a step runs every time, whatever the branch is, and the
# push of a commit that changed one line in a markdown table takes minutes. In those minutes the
# owner manages to read it as hung and refuse it. The delivery rule demands the same from the
# pipeline: a branch that touched not one line of code raises no stand, takes no frames and builds
# no images.
#
# A branch counts as textual when every touched file is either `.md` or lies under the texts
# directory. Everything else, including the harness and settings, counts as code: the sign must err
# towards an extra run, not a missed one. An empty base means there is nothing to compare with —
# then the sign stays silent and everything runs.
rt_push_docs_only_default() {
    [ -z "$1" ] && return 1
    changed="$(git diff --name-only "$1"...HEAD 2>/dev/null)"
    [ -z "$changed" ] && return 1
    printf '%s\n' "$changed" | grep -qvE "(^${RT_DOCS_DIR:-docs}/|\.md\$)" && return 1

    return 0
}

rt_push_checks_default() {
    runner="$(rt_runner)"
    root="${CLAUDE_PROJECT_DIR:-.}"
    [ -f "$root/.claude/rt-kit.json" ] && printf '%s\n' "$runner agent-kit sync --check"
    if [ -n "$1" ]; then
        printf '%s\n' "$runner nx affected -t lint test build --base=$1"
    else
        printf '%s\n' "$runner nx run-many -t lint test build --all"
    fi
    [ -f "$root/stylelint.config.js" ] && printf '%s\n' "$runner stylelint \"**/*.scss\" --max-warnings 0"

    # The guard scenarios are the same code as everything else: both the branch review and the
    # confidence that the harness still works rest on them. The run takes seconds: it builds
    # nothing.
    [ -x "$root/$RT_HOOKS_TESTS" ] && printf '%s\n' "bash $RT_HOOKS_TESTS"

    for check in check-doc-paths check-specs check-file-size check-dupes check-styles \
        check-glossary check-lib-layers check-reuse check-schema-drift check-states check-state-next \
        check-turn-map check-work-steps check-spec-coverage check-archive-age check-profile-drift \
        check-hook-scope check-push-gate; do
        [ -f "$root/$RT_CHECKS_DIR/$check.mjs" ] && printf '%s\n' "node $RT_CHECKS_DIR/$check.mjs"
    done

    return 0
}

# Which document must travel by the same commit as this file. Prints a path pattern or stays silent.
rt_docs_pair_for_default() {
    case "$1" in
        # A test is not a description of the code: it checks it.
        *.spec.ts) return 0 ;;
        # The contract is edited together with the domain spec: having drifted apart, both lie.
        *.proto) printf '%s' 'docs/specs/.*/spec\.md' ;;
        # A rule and its sidecar are not named here: their pair is held by the guard itself, and
        # held more precisely — it checks the section against the statements, not the fact of a file
        # edit. A hook and its scenario set: the guard parses the text of commands, and a refinement
        # of the pattern usually shifts the border rather than narrows it.
        .claude/hooks/*.sh) printf '%s' '.claude/hooks/tests/.*' ;;
    esac
}

# What this file is linted with right after the edit. Prints a command or stays silent.
#
# The path is substituted here rather than left as a positional parameter: the hook executes what is
# printed by evaluating the string, and `$1` in it would resolve to the hook's own parameter, that
# is, to nothing.
rt_lint_for_default() {
    runner="$(rt_runner)"
    case "$1" in
        *.scss) printf '%s stylelint --max-warnings 0 "%s"' "$runner" "$1" ;;
        *.ts | *.html) printf '%s eslint "%s"' "$runner" "$1" ;;
    esac
}

# The directory of task folders. Empty — there is no conduct of work by a folder in the tree, and
# the plan guard stays silent. The directory of the project's texts: by it the edit composition sign
# tells a text branch from a code branch.
RT_DOCS_DIR="${RT_DOCS_DIR:-docs}"

RT_TASKS_DIR="${RT_TASKS_DIR:-docs/tasks}"

# The directory of records about finished work. What explains the decisions of a closed task is
# moved there. The delivery guard demands that a branch which removed a task folder add something
# here: removing is easier than taking apart, and the owner's words are written nowhere else.
RT_ARCHIVE_DIR="${RT_ARCHIVE_DIR:-docs/archive}"

# The size of the session window in tokens and the guard thresholds. Empty — there is no guard:
# there is nothing to count the share from, and a size derived from the session record would lie —
# the model is written there without a mark about the extended window. The tree sets it in the agent
# settings, by an environment variable of the same name.
#
# The same two numbers set the threshold at which the tool compacts the context itself — and so the
# threshold at which the session handover is written. In the agent settings they are answered by a
# pair: the autocompaction window size and the percentage share at which it comes. Having drifted
# apart, they give a session that either compacts before the handover is written or lives up to the
# window limit. Whether they are aligned is told by the layout status review; here the package has
# no values of its own, because the window belongs to the tree, not to it.
#
# Aligned means not matching numbers but spread ones. The compaction threshold must stand BELOW the
# stop threshold: what continues the session fires first, not what stops it. A matching pair is a
# race, and the guard wins it: it stands on the tool call, while compaction comes between turns.
# Exactly so the session halted at the threshold instead of continuing compacted — while the audit
# counted both sides as configured.
#
# How much lower is the tree's own number: compaction is not instant, and a difference of one
# percent satisfies the "below" requirement without saving the work. The margin is declared, not
# derived from the difference.
RT_WINDOW_TOKENS="${RT_WINDOW_TOKENS:-}"
RT_WINDOW_WARN_PCT="${RT_WINDOW_WARN_PCT:-40}"
RT_WINDOW_STOP_PCT="${RT_WINDOW_STOP_PCT:-50}"
RT_WINDOW_MARGIN_PCT="${RT_WINDOW_MARGIN_PCT:-5}"

# Where the session handover is put. Outside the tree: the work state lives in the progress and is
# committed, while the handover retells it for pasting into a new session and does not travel into
# history.
RT_HANDOFF_DIR="${RT_HANDOFF_DIR:-.claude/handoff}"

# The commands that pass after the stop threshold: the session closes with them. Refusing them would
# take away its only way to end. A call counts by the start of the line or right after a separator —
# a mention of a command in text does not count as a command.
rt_handoff_allowed_cmd_default() {
    case "$1" in
        git\ * | *[\;\&\|]\ *git\ * | *\$\(git\ *) return 0 ;;
        gh\ * | */gh\ * | glab\ * | */glab\ * | az\ * | */az\ *) return 0 ;;
        *task:move* | *check:* | mkdir\ -p\ * | cat\ * | ls\ *) return 0 ;;
    esac

    return 1
}

# Where the texts read before a question to the owner lie: laws, rules and product agreements. By
# them the conversation guard judges whether anything at all was read during the turn, and it names
# them in the hint. Empty for laws and rules at once — the tree does not get this requirement: there
# is nothing to read.
RT_LAWS_DIR="${RT_LAWS_DIR:-docs/constitution}"
RT_RULES_DIR="${RT_RULES_DIR:-.claude/skills}"
RT_SPECS_DIR="${RT_SPECS_DIR:-docs/specs}"

# The directory of plans that outlive one task: the order of an epic's tasks lies there, not in the
# rules.
RT_PLANS_DIR="${RT_PLANS_DIR:-docs/plans}"

# The main branch. The guard needs it to find the common ancestor and understand what the branch did
# with the task folder and with the archive. If there is no common ancestor, there is nothing to
# compare with — the check stays silent.
RT_MAIN_BRANCH="${RT_MAIN_BRANCH:-main}"

# The name of the hosting client in the launch line. By it the restart guard recognises the call:
# each kind of hosting has its own client, and a guessed name matches nothing. The default is
# written for the most common kind; a tree with other hosting names its own.
RT_HOST_CLI="${RT_HOST_CLI:-gh}"

# The PR body by its number. A bypass of a requirement is written in the PR, and the merge command
# does not carry it — only the number is there. An empty reply means "nobody to ask": then the
# bypass is looked for only in the command text.
rt_report_body_default() {
    command -v gh >/dev/null 2>&1 || return 1
    gh pr view "$1" --json body -q '.body' 2>/dev/null
}

# Whether this is application code. Success — yes, and then the edit demands a plan on disk.
#
# The sign is the path, not a judgement by eye: the judgement is made by the one it hinders, and the
# threshold drifts. Rules, texts, the harness and dependencies do not fall under the requirement —
# otherwise the grill of a task could not be conducted before the branch is created.
#
# The path is judged relative to the tree root. A directory with the word `projects` in its name
# occurs outside the repository too, and an edit of a file outside the root does not dispose of this
# branch's plan at all. The guards hand the whole absolute path here, and a substring pattern would
# match the agent's home directory exactly as it matches the tree's code.
rt_is_app_code_default() {
    root="${CLAUDE_PROJECT_DIR:-$PWD}"
    case "$1" in
        "$root"/*) rel="${1#"$root"/}" ;;
        /*) return 1 ;;
        *) rel="$1" ;;
    esac
    case "$rel" in
        apps/* | libs/* | projects/*) return 0 ;;
        *) return 1 ;;
    esac
}

# Parsing a shell command — whether it writes and which paths it names — lives in a neighbouring
# file: together with it the profile outgrew the length limit, and these two functions are read
# apart.
# shellcheck disable=SC1090
[ -f "$(dirname "${BASH_SOURCE[0]}")/shell.sh" ] && . "$(dirname "${BASH_SOURCE[0]}")/shell.sh"

# The name of a branch from which a PR may be opened: the task number stands in the name. The prefix
# is either the kind of edit or the work queue label: both forms carry the number, and that is what
# is needed.
#
# The tail after the number is lowercase and hyphenated. A branch name is read by eye in a list and
# typed by hand, and case in it distinguishes two branches that differ only by it — and the one
# needed is not found at the first switch.
rt_task_branch_ok_default() {
    printf '%s' "$1" \
        | grep -qE '^([A-Z]+-)?[0-9]+-[a-z0-9][a-z0-9-]*$|^(feat|fix|refactor|docs|chore|style|perf|test|build|ci)/[0-9]+-[a-z0-9][a-z0-9-]*$'
}

# The task number from the branch name. A second question to the same name: the form answers "is it
# fit", this one — "what is it", and they cannot be folded into one: one returns a code, the other a
# string.
#
# The forms are the same the form check above knows: the prefix is either the task key with a
# hyphen, or the kind of edit with a slash, or there is none at all. Having drifted from it, the
# parse would leave the form lawful and the number empty — and the check of the branch number
# against the PR title number would be skipped silently while looking matched.
#
# The tail after the number is deliberately not judged here. `RT-9_guest` is a miss in the
# separator, not a deliberately taskless branch, and the number has to be taken out of it so that
# the name form has something to be checked against. Requiring the hyphen left such a name without a
# number, and the guard let it through as a trial branch.
rt_task_branch_number_default() {
    printf '%s' "$1" | sed -nE 's#^([A-Za-z]+[-/])?([0-9]+).*#\2#p'
}

# The address of the production storage: the pattern by which it is recognised on the command line —
# the tunnel port, the host, the domain. Any write by it is refused outright, and the opt-out does
# not apply. The default stays silent: someone else's address here is more dangerous than an unnamed
# one — it would refuse work with the local database.
RT_PROD_DSN="${RT_PROD_DSN:-}"

# The dev environment connections by sight: by the query text alone production cannot be told from a
# local copy, the database is chosen by the connection identifier. The identifiers are local to the
# machine.
RT_PROD_CONNECTIONS="${RT_PROD_CONNECTIONS:-}"
RT_LOCAL_CONNECTIONS="${RT_LOCAL_CONNECTIONS:-}"

# The ports of one-off databases: no question is asked about them. Not named — there is no exception
# at all.
RT_SCRATCH_PORT_RE="${RT_SCRATCH_PORT_RE:-}"

# The form of the number in the PR title. The same number stands on the task and on the branch.
RT_TASK_TITLE_RE="${RT_TASK_TITLE_RE:-^\[[A-Za-z]+-[0-9]+\][[:space:]]+[^[:space:]]}"

# What creates a task and what audits the work queue. They go into the refusal text of the delivery
# guard: a refusal without an action is bypassed, not carried out.
RT_TASK_NEW_CMD="${RT_TASK_NEW_CMD:-npm run task:new}"
RT_BOARD_CHECK_CMD="${RT_BOARD_CHECK_CMD:-npm run check:board}"

# What removes the archive records that outstayed their term. The progress guard does not judge this
# command. Records age by the calendar, and the term step goes red by itself, without a single edit
# in the branch. That includes a branch into which work is brought by merges and where no task
# folders are created at all. Demanding a plan for such a cleanup would leave the PR red with no way
# out. Empty — the command is not named, and there is no exit from under the guard.
RT_ARCHIVE_PRUNE_CMD="${RT_ARCHIVE_PRUNE_CMD:-}"

# The account that is set as the assignee and that opens the PR. The default stays silent: every
# tree has its own, and some have none at all.
RT_TASK_BOT="${RT_TASK_BOT:-}"

# The emails of the people who commit into this tree by hand, separated by spaces. By naming them
# the tree turns on the second half of the signature check: the machine account and these people are
# known, everything else is refused. Empty — only a commit that called itself the machine account is
# judged, and a commit under someone else's account passes silently.
RT_HUMAN_EMAILS="${RT_HUMAN_EMAILS:-}"

# What substitutes the machine account token into a call and how that substitution looks in full.
# The hosting client holds two accounts at once — the logged-in one and the one whose token stands
# in the call environment — and only the explicit substitution is visible from the command text.
# Both defaults stay silent: a tree without a separate machine account does not judge the PR author
# at all.
RT_PULL_TOKEN_VAR="${RT_PULL_TOKEN_VAR:-}"
RT_PULL_TOKEN_HINT="${RT_PULL_TOKEN_HINT:-}"

# Who will come to the hosting by this token. The substitution in the command speaks only of intent:
# it reads a file, and the file may be missing on the machine. Then the value is empty, the client
# answers from the logged-in account, and the PR comes out from the owner with a command that looks
# right. Asking this costs one call, but only the tree knows how to ask: the hosting, the client and
# the token path are each tree's own. The default stays silent: a tree that did not declare the
# function does not get the second tier.
#
# The contract: prints the login under which the writing call will go. Empty output means "could not
# ask" — the guard lets the call through and reports it.
rt_pull_token_login() { :; }

# The section the PR body must carry from the minute it is opened: the merge decision is made on its
# page, where there is no conversation at all, and what was said aloud does not remain there. The
# default stays silent — the heading is written in the PR's language, and the package does not know
# foreign words: a section not named by the tree is not judged at all.
RT_PULL_BODY_SECTION="${RT_PULL_BODY_SECTION:-}"

# The command that moves a task between the columns of the work queue, and the name of the first
# column — the one the task leaves when it is taken into work. The name has no default: the tree
# names the columns in its own words, and an invented one would match nothing and silently turn off
# the column check.
RT_TASK_MOVE_CMD="${RT_TASK_MOVE_CMD:-npm run task:move}"
RT_BOARD_BACKLOG="${RT_BOARD_BACKLOG:-}"

# The label of an epic card: by it the guard tells the branch of an epic from the branch of a task,
# and the branch of an epic is judged by other conditions — its request goes into the main branch,
# and it opens only when the folders of all its tasks are taken apart. The word is each tree's own,
# and the default is empty: a tree that has not named it keeps no epics, and the conditions about
# them are not judged at all.
RT_BOARD_EPIC_LABEL="${RT_BOARD_EPIC_LABEL:-}"

# The email the machine account's commit is signed with. As a whole value, not a pattern: the
# hosting's service address consists of a number, a login and a domain, and is matched by the number
# — nobody checks the login next to it. A "number, plus, login" pattern would pass with someone
# else's number, that is, with exactly the miss for which the delivery guard reads the signature.
#
# From here it also takes the machine account's login — the left part of the address, before the at
# sign and after the plus. The login is not declared as a second property: two declarations of one
# name would drift apart silently. The task assignee is not fit for this — where the hosting has
# restricted the machine account, a person is set as the assignee, and the commit stays the
# machine's.
#
# The default stays silent, and then the signature is not judged: the package has no machine account
# of its own, and an invented one would refuse work in someone else's tree.
RT_COMMIT_EMAIL="${RT_COMMIT_EMAIL:-}"

# The task state as one object: exists, open, onBoard, assigned, numbered. Asks the work queue
# helper — the same one the audit and the create command use, so that the guard and the queue
# understand "the task is in order" alike. No node, no helper, no network — silence, and the state
# tier is skipped: there is nothing to check with.
rt_task_state_default() {
    command -v node >/dev/null 2>&1 || return 1
    [ -f "${RT_BOARD_HELPER:-tools/board.mjs}" ] || return 1
    state="$(node "${RT_BOARD_HELPER:-tools/board.mjs}" task "$1" 2>/dev/null)" || return 1
    [ -z "$state" ] && return 1
    # A reply marked "there was no network" is never a state: by it a task that does not exist
    # cannot be told from a task that was not asked about.
    printf '%s' "$state" | jq -e 'has("offline") | not' >/dev/null 2>&1 || return 1
    printf '%s' "$state"
}

# The PR state as one object: exists, draft, author, reviewers, reviewed. Asks the same work queue
# helper as the task state — so that the guard and the audit understand "the PR has a review" alike.
# No node, no helper, no network — silence, and the tier is skipped.
rt_pull_state_default() {
    command -v node >/dev/null 2>&1 || return 1
    [ -f "${RT_BOARD_HELPER:-tools/board.mjs}" ] || return 1
    state="$(node "${RT_BOARD_HELPER:-tools/board.mjs}" pr "$1" 2>/dev/null)" || return 1
    [ -z "$state" ] && return 1
    printf '%s' "$state" | jq -e 'has("offline") | not' >/dev/null 2>&1 || return 1
    printf '%s' "$state"
}

# One's own open PRs marked as conflicting — one line per PR: "#number branch". Asks the same work
# queue helper as the two neighbours above. Empty output means "no conflicting ones", a failing exit
# code — "nobody to ask", and the guard tier is skipped: refusing work on the silence of the network
# would stop it every time there is nothing to check it against.
rt_conflicting_pulls_default() {
    command -v node >/dev/null 2>&1 || return 1
    command -v jq >/dev/null 2>&1 || return 1
    [ -f "${RT_BOARD_HELPER:-tools/board.mjs}" ] || return 1
    state="$(node "${RT_BOARD_HELPER:-tools/board.mjs}" conflicts 2>/dev/null)" || return 1
    [ -z "$state" ] && return 1
    printf '%s' "$state" | jq -e 'has("conflicting")' >/dev/null 2>&1 || return 1
    printf '%s' "$state" | jq -r '.conflicting[]? | "#\(.number) \(.branch)"'
}

# What counts as reinvention in this tree. One line per "pattern<tab>replacement". The patterns are
# narrow on purpose: the guard checks only NEW text, and a wide pattern would refuse an edit that
# creates nothing new.
rt_reinvented_in_default() {
    # Four tab-separated fields: what over, the pattern, the cancel pattern, the replacement. An
    # empty field is written empty — they are read one by one, and collapsing the third carried the
    # advice into the cancel.
    case "$1" in
        *.ts)
            printf '%s\t%s\t%s\t%s\n' 'added' 'get [a-zA-Z]+\(\)[[:space:]]*(:|\{)' '' 'computed(): производное значение сигналом, а не геттером'
            ;;
        *.scss)
            printf '%s\t%s\t%s\t%s\n' 'added' '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b' '' 'токен оформления вместо записанного цвета'
            ;;
    esac
}

# Where the uniformity signal sets lie — they are laid out next to the checks, and the layout of
# checks is each tree's own. Both the guard on an edit and the full audit read them.
RT_REUSE_SIGNALS_DIR="${RT_REUSE_SIGNALS_DIR:-tools/signals}"

# Where an anchor for the specs is not required. The showcase, the root markup and the build are
# common to all trees; a tree adds its own by an override.
RT_QA_SKIP_RE="${RT_QA_SKIP_RE:-/node_modules/|/dist/|\.stories\.html\$|/src/index\.html\$}"

# By which name a tag is recognised as a component of this tree. The default is a compound tag: a
# hyphenated name belongs to a component, not to markup, and that is true wherever there are
# components of one's own.
RT_QA_COMPONENT_RE="${RT_QA_COMPONENT_RE:--}"

# The tags the spec does not press: styling, page markup, indicators. Listed by name, separated by
# spaces. The default stays silent: every kit has its own, and a foreign name here would silence the
# check on a tag this tree does not have.
rt_qa_decorative_default() {
    return 0
}

# Defaults under the shared names. The project override will declare any of them anew — and call the
# same name from here with the `_default` suffix for everything it did not name itself.
rt_push_checks() { rt_push_checks_default "$@"; }
rt_push_docs_only() { rt_push_docs_only_default "$@"; }

rt_docs_pair_for() { rt_docs_pair_for_default "$@"; }
rt_lint_for() { rt_lint_for_default "$@"; }
rt_task_branch_ok() { rt_task_branch_ok_default "$@"; }
rt_task_branch_number() { rt_task_branch_number_default "$@"; }
rt_reinvented_in() { rt_reinvented_in_default "$@"; }
rt_is_app_code() { rt_is_app_code_default "$@"; }
# The directory of the rules package sources in this tree, from the root. Empty — the tree does not
# carry the package, and it has one edit address: the override. The tree that develops the package
# itself names the directory — otherwise the edit-place guard would send it to the override instead
# of the source.
rt_kit_sources_dir_default() { printf ''; }

rt_shell_writes() { rt_shell_writes_default "$@"; }
rt_shell_paths() { rt_shell_paths_default "$@"; }
rt_kit_sources_dir() { rt_kit_sources_dir_default "$@"; }
rt_qa_decorative() { rt_qa_decorative_default "$@"; }
rt_task_state() { rt_task_state_default "$@"; }
rt_pull_state() { rt_pull_state_default "$@"; }
rt_conflicting_pulls() { rt_conflicting_pulls_default "$@"; }
rt_report_body() { rt_report_body_default "$@"; }
rt_handoff_allowed_cmd() { rt_handoff_allowed_cmd_default "$@"; }

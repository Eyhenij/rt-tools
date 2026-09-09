#!/usr/bin/env bash
# This tree's profile: what is called what here and which commands check it.
#
# It lives in the project rather than in the package: the mechanism of the guard hooks is shared,
# while the commands, the ports and the pairs "an edit — its document" are each tree's own. The
# package brings the hooks, the project brings this file.
#
# Every function may stay silent. Silence means "there is no rule for this", and the hook lets it
# through: an empty profile leaves the hooks harmless rather than refusing at random.

# Where the showcases come up. This repository holds no applications at all: it publishes packages,
# and what is looked at live is the showcases.
RT_STANDS='the ui-kit showcase http://localhost:6006, the ui-kit-v2 showcase http://localhost:6007'

# The shape of the number in a PR title and the task state by number are taken from the package as
# they are.
#
# Both were once overridden here: the tasks had no key, the number stood at the tail of the title
# — «Что сделано (#312)» — and the guard reading the form `[KEY-123]` got the number out of neither
# the title nor the branch. The match of the numbers was checked by nothing at that, and the task
# state had to be gathered by the profile. The key `RT` is declared in
# `.claude/rt-kit/checks.json`, the task, the branch and the PR carry it the same way, and both
# overrides became a lie about the tree.

# The email a machine commit is signed by. The same string stands in the companion of the delivery
# rule, and it is taken from there: typed from memory, it has already cost the tree a rewritten
# history — the number in the service address belonged to an outside person, and the hosting
# ascribed eleven commits to them. The guard reads the machine account's login from here too, by
# the left part of the address.
#
# The same account stands as the assignee of the tasks: what it creates is visible both to the
# owner and to the audits. The former one, `rt-tools-agent`, was limited by the hosting — under it
# the owner had to be set as the assignee — and with the move to the new one that departure is
# lifted.
RT_COMMIT_EMAIL='317887029+rt-tools-dev@users.noreply.github.com'

# What the machine account's token is substituted into a call by, and how that substitution looks
# whole. The hosting client is signed in as the owner, so a call without the substitution goes from
# them: the request comes out from the owner, they cannot be assigned as its reviewer then — the
# author of a request is never its reviewer — and that is cured only by reopening. The delivery
# guard reads both strings: by the first it looks for the substitution in the text of the command,
# the second it prints in the refusal ready to use.
# The account of the machine work: it stands as the assignee of the tasks and the author of the
# requests.
RT_TASK_BOT='rt-tools-dev'

# The emails of the people who commit into this tree with their own hands. Named, they switch on
# the second half of the signature check: the machine account and these people are known, and
# everything else is refused — a commit under an account the tree never declared used to pass in
# silence.
RT_HUMAN_EMAILS='72300075+Eyhenij@users.noreply.github.com 41898282+github-actions[bot]@users.noreply.github.com'

RT_PULL_TOKEN_VAR='GH_TOKEN'
RT_PULL_TOKEN_HINT='GH_TOKEN=$(cat ~/.config/rt-tools-bot-token)'

# Who will come to the hosting by this token. The same file is read as in the substitution above:
# there is no file — the value is empty, the client answers from the owner's signed-in account, and
# the delivery guard sees that by the login rather than by the text of the command.
#
# The client is called by its full path: in the owner's shell that name is taken by a password
# manager's alias, and a call by the name would wait for a confirmation nobody will give the guard.
rt_pull_token_login() {
    local token
    token="$(cat ~/.config/rt-tools-bot-token 2>/dev/null)"
    GH_TOKEN="$token" /opt/homebrew/bin/gh api user --jq .login 2>/dev/null
}

# The section the request body carries from the minute it is opened. The owner merges by the
# hosting's button as soon as they see green — and all that the requirement to take the folder
# apart is held by there is the section they read on the page. Once they merged a request while the
# run was going, and the task folder travelled into the main branch untaken-apart.
#
# The heading is written in the language of the request, so the sample stands here rather than in
# the package. A second-level heading is judged, not a word anywhere in the body: the words
# «оставшийся шаг» occur in prose too.
RT_PULL_BODY_SECTION='^##[[:space:]]+Оставшийся шаг[[:space:]]*$'

# The board's first column — the one a task is taken into work from. The delivery guard matches it
# against the task's column and refuses the delivery while the task has not left it: by the work
# queue such a task reads as untaken, although the work on it is already laid out.
#
# It is written by the column's full name, together with the sign: the board answers with the name
# rather than with a short key — the short `backlog` from `.claude/rt-kit/checks.json` would match
# nothing and silently switch the check off. Without the declaration the guard does not judge the
# column at all.
#
# One column is judged. «🆕 New», where the board rule puts a task rather than the creating command,
# stays covered by nothing: the guard matches the whole name and knows no second one.
RT_BOARD_BACKLOG='📋 Backlog'
RT_BOARD_EPIC_LABEL='epic'

# What the records about finished work that outstayed their retention are removed by. The work
# guard does not judge this command: the records age by the calendar, and the retention step turns
# red by itself, without an edit in the branch — while in an epic's branch, where work is brought
# by merges, there is no task folder, and without the output the request would stay red with no way
# out. The whole command is matched, not an occurrence.
RT_ARCHIVE_PRUNE_CMD='node tools/archive-prune.mjs --apply'

# The commands that must pass before a push. One per line; the first that falls refuses the push.
# The style linter goes on a line of its own: the code linter does not read style files at all.
#
# It is called by a named script rather than by the command laid out: the warning threshold is
# declared at it once, and the guard, the end-to-end run and a call by hand do not diverge.
#
# What every pipeline step here is closed by is in `pushGate.steps` of `.claude/rt-kit/checks.json`,
# and `check-push-gate` refuses a push when a step is closed neither by a line from here nor by an
# exception with a reason. The build and the matching of the built packages stand here for exactly
# that reason: without them the set was narrower than the pipeline one, and twice in a row a PR left
# with the word "checked" about what was never run.
#
# The image build stands here for the same reason but speaks of something else: `nx build` builds
# from the tree whole, while an image is built from its own set of copied directories, and a missing
# directory is visible only by building the image itself. The step needs a raised daemon; it is not
# raised — the command refuses, and that is more honest than a push with the word "checked" about
# what was never built.
#
# The spec matching goes on the first line: it costs half a second on the whole tree and refuses
# before a ten-minute run begins. The pipeline does not run it at all, and until this line a red
# matching refused nothing: 208 divergences piled up in the main branch silently, while its output
# was read by hand and not always. Its known boundary is that the guard stands on the agent's
# commands, and a push by hand goes past it.
#
# The duplication check stands next to it and for the same reason: the pipeline does not run it, and
# until this line its red refused nothing. One's own enumeration under an already declared set is
# seen neither by the lint, nor by the build, nor by the tests — every copy is sound on its own.
#
# The layout matching stands there too and on the same occasion: the pipeline does not run it, and
# until this line its red refused nothing — a debt stood from the week before and twice in a session
# got in the way of someone else's work. Here it is called by a named script of the tree rather than
# by a dependency's binary: the rules package lies in this same tree and is built from the sources,
# so the matching first rebuilds it and then reads what was built. That costs about six seconds
# together with the build.
#
# The package default is called rather than rewritten here as lines. One's own enumeration named
# eight checks out of fourteen, while six — `check-doc-paths`, `check-file-size`, `check-styles`,
# `check-lib-layers`, `check-reuse`, `check-schema-drift` — lay in `tools/` and were run by nothing:
# neither by this set nor by the pipeline. The completeness of the set is judged by
# `check-push-gate`, and it judges by the names of the pipeline steps — it will not miss a check
# that is not in the pipeline either, and the loss is silent on both sides. Enumerated as lines, the
# six names would close today's hole and leave tomorrow's: a check the package creates in its next
# edition would again not reach the tree, and the miss would be the very same.
#
# What one's own line already covers is filtered out, and every kind is named by name — otherwise
# the set would run one thing twice:
#
#   - `agent-kit sync --check` — here it is called `pnpm run agent-kit:check`: the rules package
#     lives in this tree, and what must be matched is what is built from its sources rather than a
#     dependency's binary, which is not in `node_modules` at all;
#   - `nx run-many -t lint test build` and `nx affected -t lint test build` — the line here is
#     stricter: it holds `typecheck`, which the default does not have;
#   - `stylelint "**/*.scss"` — here it is called `pnpm run lint:styles`: the warning threshold is
#     declared at it once, and the guard, the pipeline and a call by hand do not diverge;
#   - `check-specs`, `check-dupes`, `check-push-gate` — the very same lines named above.
#
# The samples are kept narrow deliberately: nothing but what is enumerated falls under them, so a
# check the package creates tomorrow reaches here by itself.
rt_push_checks() {
    cat <<'EOF'
pnpm run agent-kit:check
node tools/check-specs.mjs
node tools/check-dupes.mjs
node tools/check-hooks.mjs
node tools/check-cycles.mjs
node tools/check-boundary.mjs
node tools/check-descriptions.mjs
node tools/build-tokens-v2.mjs --check
node tools/check-tokens-graph.mjs
node tools/check-tokens-theme.mjs
node tools/check-preset-complete.mjs
node tools/check-gradient-stops.mjs
node tools/check-icon-map.mjs
node tools/check-preset-stories.mjs
node tools/check-showcase-links.mjs
node tools/check-kit-shot-pairs.mjs
node tools/check-kit-coverage.mjs
node tools/check-tokens-styles.mjs
node tools/check-cascade-layer.mjs
node tools/check-format-ignore.mjs
node tools/check-publish-lockfile.mjs
node tools/check-package-imports.mjs
bash tools/tests/run.sh
EOF

    rt_push_checks_default "$1" \
        | grep -vE 'agent-kit sync --check|nx (run-many|affected) -t lint test build|stylelint "\*\*/\*\.scss"|tools/check-(specs|dupes|push-gate)\.mjs'

    cat <<'EOF'
pnpm exec nx affected -t lint typecheck test build --parallel
pnpm exec nx affected -t test-hooks
pnpm run lint:styles
pnpm exec nx affected -t verify --parallel
node tools/check-push-gate.mjs
EOF

    # The heavy steps go by their own subject rather than by the sign "the branch touched code".
    #
    # Before, the sign was all or nothing: a branch counted as textual when every touched file was
    # either `.md` or under `docs/`, and everything else pulled the full set. The argument next to
    # it was right — err towards a needless run — but between "run everything" and "run nothing" a
    # third is missed: run what the branch touched.
    #
    # That cost twice. Pushing a commit with one line in a markdown table raised the stand, took two
    # showcases and built two images — the owner refused such a push three times in a session,
    # taking it for a hung one. Later a branch that fixed one sign in the agent's hooks paid the
    # same way and was **refused** by an unstable snapshot of somebody else's button: an edit of a
    # guard stood because of a frame of a component it never touched.
    #
    # Every step has a subject of its own, and it is declared by paths. A branch that touched none
    # of a subject's paths does not pay for it. The sign errs towards the former side at that: a
    # path that fell into no subject, and the tree's shared base, raise the whole set — the unknown
    # reads as "it could have touched anything". An empty base means there is nothing to compare
    # against: everything is run, and the completeness matching calls the function with that same
    # empty base — it sees the list whole.
    e2e='pnpm exec nx run message-bus-admin-e2e:e2e'
    shot_v1='node tools/visual-gate.mjs ui-kit'
    shot_v2='node tools/visual-gate.mjs ui-kit-v2'
    img_api='docker build -f deploy/message-bus.Dockerfile -t message-bus:gate .'
    img_web='docker build -f deploy/message-bus-web.Dockerfile -t message-bus-web:gate .'

    if [ -z "$1" ] || ! rt_push_touched "$1" >/dev/null 2>&1; then
        printf '%s\n%s\n%s\n%s\n%s\n' "$e2e" "$shot_v1" "$shot_v2" "$img_api" "$img_web"

        return 0
    fi

    _touched="$(rt_push_touched "$1")"

    case " $_touched " in
        *' everything '*)
            printf '%s\n%s\n%s\n%s\n%s\n' "$e2e" "$shot_v1" "$shot_v2" "$img_api" "$img_web"

            return 0
            ;;
    esac

    case " $_touched " in *' receiver '*) printf '%s\n%s\n%s\n' "$e2e" "$img_api" "$img_web" ;; esac
    case " $_touched " in *' kit1 '*) printf '%s\n' "$shot_v1" ;; esac
    case " $_touched " in *' kit2 '*) printf '%s\n' "$shot_v2" ;; esac
}

# Which subjects the branch touched. It prints the subject words separated by spaces; `everything`
# means there is nothing to split — the shared base was touched, or a path the sign did not
# recognise.
#
# An empty list of what was touched does not count as a subject: there is nothing to compare
# against, and silence here would read as "there is nothing to change". Such a call ends with a
# non-zero code, and the caller runs the whole set.
rt_push_touched() {
    _changed="$(git diff --name-only "$1"...HEAD 2>/dev/null)"
    [ -z "$_changed" ] && return 1

    _subjects=''
    _add() { case " $_subjects " in *" $1 "*) ;; *) _subjects="${_subjects}${_subjects:+ }$1" ;; esac; }

    for _f in $_changed; do
        case "$_f" in
            # The texts, the agent's harness and the tree's checks: they have no heavy step of
            # their own.
            #
            # The checks read the tree and build nothing in it: neither the showcase nor the
            # receiver changes from an edit of them. While they fell into the general case, an edit
            # of one check raised the end-to-end suite, two snapshot sets and two image builds — six
            # minutes for a line none of those subjects is touched by.
            docs/*|*.md|.claude/*|projects/agent-kit/*|tools/*) ;;
            # The kits — each with a showcase of its own.
            projects/ui-kit/*) _add kit1 ;;
            projects/ui-kit-v2/*) _add kit2 ;;
            # The receiver, the admin panel, its end-to-end suite, the rollout and the database
            # schema.
            apps/message-bus*|deploy/*|prisma/*) _add receiver ;;
            # Everything else — the shared libraries, the root settings, the build harness, the
            # pipeline. They cannot be split between the subjects: they act on any of them.
            *) _add everything ;;
        esac
    done

    printf '%s' "$_subjects"
}

# Whether the branch touched only texts. A zero code — only texts, otherwise — code.
#
# An empty list of what was touched does not count as a textual edit: there is nothing to compare
# against, and silence here would read as "there is nothing to change".
rt_push_docs_only() {
    changed="$(git diff --name-only "$1"...HEAD 2>/dev/null)"
    [ -z "$changed" ] && return 1
    printf '%s\n' "$changed" | grep -qvE '(^docs/|\.md$)' && return 1

    return 0
}

# Which document must travel by the same commit as this file. It prints a path sample or stays
# silent.
rt_docs_pair_for() {
    case "$1" in
        # A spec is not a description of a component: it checks it.
        *.spec.ts) return 0 ;;
        # The description of a second-kit component lies next to it and is edited by the same
        # motion.
        projects/ui-kit-v2/src/lib/*/*/*.component.ts)
            printf '%s' "${1%/*}/CONTEXT\.md" ;;
        # The styling token set is described in one document, and a new token without a line in it
        # cannot be found by anything: the token names are enumerated nowhere else.
        projects/ui-kit/src/styles/base/_tokens.scss | projects/ui-kit/src/styles/base/_color-scheme.scss)
            printf '%s' 'projects/ui-kit/src/styles/TOKENS\.md' ;;
        # The structure of production, the path of a request and the sorting out of silence are
        # described by a text neither the linter nor the build reads: a divergence of the make-up
        # from the description piles up silently.
        docker-compose.prod.yml | deploy/Caddyfile | .github/workflows/deploy.yml)
            printf '%s' 'docs/PROD\.md' ;;
    esac
}

# What this file is linted by right after an edit. It prints a command or stays silent.
#
# The path is substituted here rather than left as a positional parameter: the hook runs what is
# printed by computing the string, and `$1` in it would resolve to the hook's own parameter, that
# is, to nothing.
rt_lint_for() {
    case "$1" in
        *.scss) printf 'pnpm exec stylelint --max-warnings 0 "%s"' "$1" ;;
        *.ts | *.html) printf 'pnpm exec eslint "%s"' "$1" ;;
    esac
}

# The name of a branch a PR may be opened from: the task key, the task number, a short name.
#
# The shape is the same as the one the task-creating command builds, and the same as the one
# `numberFromBranch` reads when matching the work queue: the three places would diverge silently,
# and a branch lawful for the guard would stay nameless for the matching. The kind of the edit does
# not go here — it lives in the commit subject, where commitlint matches it, and in the branch name
# it would only repeat what its content already shows.
rt_task_branch_ok() {
    printf '%s' "$1" | grep -qE '^RT-[0-9]+-[a-z0-9][a-z0-9-]*$'
}

# What counts as reinvention in this tree. One line per "sample<tab>what to replace it with".
# The samples are narrow deliberately: the guard matches only the NEW text, and a wide sample would
# refuse an edit that creates nothing new.
rt_reinvented_in() {
    # This tree's signs are declared as data — `.claude/rt-kit/signals.json` — and both the guard
    # and the sweeping matching read them. What stays here is what cannot be put as data: a sign
    # that depends on the file's place in the tree.
    case "$1" in
        */projects/ui-kit-v2/*.scss)
            printf '%s\t%s\t%s\t%s\n' 'added' ':host' '' 'the block class: .rt-<block>, and under a clash of names a selector by the element name'
            ;;
    esac
}

# The directory of the rules package sources. This tree develops the package too: a laid-out copy
# here is mended not by an override but by the source it is laid from. A consumer tree has no source
# at all, and the package default stays silent — the guard of the place of an edit sends such a tree
# to the override.
rt_kit_sources_dir() {
    printf 'projects/agent-kit/assets'
}

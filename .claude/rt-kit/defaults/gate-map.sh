#!/usr/bin/env bash
# rt-kit v0.29.0 · defaults/gate-map.sh · 04cf365641de · правится надстройкой, не здесь
# Map "what is edited — which rule". The package default: real paths, not samples.
#
# The trees of this workshop are built alike — Nx, `apps/` and `libs/`, the same extensions and the
# same directory names — so the package carries the map instead of every project writing it anew.
# Fifteen editions of it would drift apart silently, and the drift could be noticed only by the gate
# no longer demanding a rule where there is one.
#
# A tree adds its own by an override — `.claude/rt-kit/gate-map.sh`. It loads second, declares
# `skill_for` anew and calls `skill_for_default` from here for everything it did not name.
#
# The function prints the RULE NAME or stays silent. Silence means "there is no rule for this", and
# the gate lets it through. There may be several names, one per line: the first is the file's domain
# rule, the following ones act as the second layer. The gate demands the first one not loaded.
#
# The order of branches decides: the first match wins, so the specific goes before the general.

# Rules that apply not by the kind of file but by what is written into it are not chosen here: they
# come as a layer over the domain one — `hooks/skill-gate-layers.sh`. The map judges the path, the
# layer judges the text, and both are called from the gate in one shell.

# A command counts as a CALL only when it stands at the start of a line or right after a separator.
# A substring match catches any MENTION: a line about a commit in the body of the commit itself and
# a search through history were refused as a real commit.
#
# `([A-Za-z_]…=…[[:space:]]+)*` — environment variables before the call: the storage address is put
# as a prefix of the command itself, and without this piece the call was not recognised at all.
# `(npx…)?` — a launch through the package runner, `([^[:space:]]*/)?` — the path to the executable.
# The search parses a multi-line command line by line, so the start of the line is the start of each
# one.
rt_gate_invokes() {
    printf '%s\n' "$1" \
        | grep -qE "(^|[;&|(])[[:space:]]*([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*((npx|pnpm|yarn|bun|npm)([[:space:]]+(exec|run|dlx))?[[:space:]]+)?([^[:space:]]*/)?$2([[:space:]]|$)"
}

skill_for_default() {
    kind="$1"
    target="$2"
    written="$3"

    case "$kind" in
        edit)
            case "$target" in
                # A built tree is never code, and nobody edits it: the path to the artifact comes
                # from the command that RUNS it. Under the artifact lie the same directory names as
                # under the source, so the branch stands first — any branch below would match it and
                # demand a rule that gives the work nothing.
                */node_modules/* | */dist/* | */build/* | */.nx/* | */coverage/*) return 0 ;;

                # An override over a laid-out text is an edit of the same text: the path differs,
                # the subject is the same. The branch stands first because the override path ends
                # with the same file name as the laid-out copy, and the branches below would sort it
                # by extension — that is, by the wording rule instead of the structure rule.
                */.claude/rt-kit/overrides/laws/* | */.claude/rt-kit/overrides/rules/* | */.claude/rt-kit/overrides/patterns/*)
                    printf '%s\n' 'spec-driven' ;;

                # A rule and a pattern are the same kind of agreement as a spec: mandatory sections,
                # a statement with a binding, the border between an article of the law and a
                # statement of the rule. The branch stands before the general exception and before
                # `*.md`: under the exception the rule text was rewritten without a single
                # requirement, and `*.md` would send it to the wording rule — it is about words, not
                # structure.
                */.claude/skills/*.md) printf '%s\n' 'spec-driven' ;;

                # The rest of the agent's own files are edited without a rule: the rule for them is
                # the file itself.
                */.claude/skills/* | */.claude/agents/* | */.claude/commands/* | */.claude/workflows/*) return 0 ;;

                # The project's texts. A spec holds the structure of a domain, a law holds the
                # agreement, and both are edited differently from code.
                */docs/specs/*) printf '%s\n' 'spec-driven' ;;
                */docs/tasks/*) printf '%s\n' 'task-flow' ;;
                */docs/constitution/*) printf '%s\n' 'spec-driven' ;;
                *.md) printf '%s\n' 'doc-style' ;;

                # Linter configs are the same thing, only the bans in them are executable: they are
                # the enforcement of the rules about types and about styling, and the comments in
                # them retell those rules by name. They were edited without a single rule at hand.
                */eslint.config.mjs | */eslint.config.js) printf '%s\n' 'typescript-conventions' ;;
                */stylelint.config.js | */stylelint.config.mjs) printf '%s\n' 'styling-bem' ;;

                # The duplicates check enforces the statements of the shared-code rule and is
                # required only by it: the lib layout rule speaks of it in one line with a
                # reference, and the bindings of its signs stand with the shared-code rule. Two
                # refusals in a row on an edit of two comment lines cost a session, and the second
                # rule read is never of use.
                */tools/check-dupes.mjs | */tools/dupes-allowlist.json) printf '%s\n' 'shared-code' ;;

                # The other checks are the same: a check enforces the statements of its rule, and
                # the signs it judges by are declared in the rule's binding. Editing a sign in a
                # check, one opens the second place next to it — otherwise they drift apart
                # silently, and the check counts as a refusal what the rule allows.
                # The parsing of the spec audit lies not in the file with the `check-` prefix but
                # in the helpers next to it: anchors, contract, scenarios, the shared part. They
                # carry out the articles of the rule, and by name alone they matched no branch.
                */check-specs.mjs | */spec-anchors.mjs | */spec-common.mjs | */spec-contract.mjs | */spec-scenarios.mjs | */specs-for.mjs)
                    printf '%s\n' 'spec-driven' ;;
                */check-doc-paths.mjs | */doc-paths-allowlist.json | */check-file-size.mjs)
                    printf '%s\n' 'doc-style' ;;
                */check-styles.mjs | */styles-allowlist.json | */stylelint-rules/*)
                    printf '%s\n' 'styling-bem' ;;
                */check-lib-layers.mjs | */lib-layers-allowlist.json) printf '%s\n' 'lib-layers' ;;
                */check-reuse.mjs | */reuse-allowlist.json) printf '%s\n' 'reuse-first' ;;
                */check-board.mjs | */board.mjs | */task-new.mjs | */check-schema-drift.mjs)
                    printf '%s\n' 'git-workflow' ;;
                # A tree's own code linter rule is written by the same conventions as the code under
                # it.
                */eslint-rules/*) printf '%s\n' 'typescript-conventions' ;;

                # The storage schema, its migrations and the client setup: the directory order is
                # lexicographic, and the timestamp is set by the tool at creation. The chain breaks
                # silently and fails only on an apply from scratch, that is, after the merge. The
                # client setup stands here too: the same apply reads it, and it was edited without a
                # rule at hand. The rule lives with the delivery.
                */schema.prisma | */prisma/migrations/* | */prisma.config.ts)
                    printf '%s\n' 'git-workflow' ;;
                # The pipeline carries two subjects at once: which checks run before the merge —
                # that is the hand-over rule — and what reaches production after it, which is the
                # rollout rule. Both names are printed, the rollout one first: the set before a push
                # is written by the executor every day, while the rollout steps are read once and
                # are the ones edited blindly.
                */.github/workflows/*.yml | */.gitlab-ci.yml | */azure-pipelines*.yml)
                    printf '%s\n' 'deploy-flow'
                    printf '%s\n' 'git-workflow' ;;

                # The image, the proxy config and the sample of the production environment are the
                # rollout's own subject, and the branch used to hand them to the rule about tasks
                # and branches: it says nothing about the server, the ports or the variables the
                # image is raised with. What is written into these files is seen by nobody until the
                # rollout, and by then it is production that answers.
                */Dockerfile | */*.Dockerfile | */docker-compose*.yml | */docker-compose*.yaml)
                    printf '%s\n' 'deploy-flow' ;;
                */Caddyfile | */nginx.conf | */*.nginx.conf | */nginx/*.conf | */.env.*.example)
                    printf '%s\n' 'deploy-flow' ;;

                # An end-to-end spec checks a running application, not a class: by file name it is
                # no different from an ordinary module, and without this branch it would go to the
                # language conventions.
                *-e2e/*) printf '%s\n' 'testing' ;;

                # Delivery: the set of dependencies is what arrives on production. An edit of
                # scripts is not a dependency, and the rule about versions does not apply to it. A
                # caveat: removing a dependency comes as an edit without a version number and does
                # not land here — it is caught by the tree snapshot, which is edited by the same
                # commit. Its own edition is not a dependency: the `"version"` line in the package's
                # own manifest speaks of this package's release, not of someone else's version it
                # pulls. The number sign caught it on a par with a dependency, and bumping its own
                # version led the executor to the rule about others' versions — not to where it says
                # how releases are made.
                */package.json)
                    printf '%s' "$written" | grep -v '"version"[[:space:]]*:' \
                        | grep -qE '"(dependencies|devDependencies|peerDependencies|optionalDependencies|overrides|resolutions|packageManager)"|"[^"]+"[[:space:]]*:[[:space:]]*"[~^]?[0-9]+\.[0-9]+' \
                        && printf '%s\n' 'dependencies' ;;
                */pnpm-lock.yaml | */pnpm-workspace.yaml | */package-lock.json) printf '%s\n' 'dependencies' ;;

                # Borders between libs: the manifest, the aliases, the barrel.
                */project.json | */tsconfig.base.json | */eslint/boundaries/* | */src/index.ts | */public-api.ts | */ng-package.json)
                    printf '%s\n' 'lib-layers' ;;

                *.spec.ts) printf '%s\n' 'testing' ;;
                *.component.ts | *.component.html) printf '%s\n' 'component-structure' ;;
                *.scss) printf '%s\n' 'styling-bem' ;;

                # Framework classes: state, streams and where a subscription lives. The backend does
                # not go here — it has neither components nor subscriptions in a template.
                */libs/api/* | */apps/api/*) printf '%s\n' 'typescript-conventions' ;;
                *.store.ts | *.service.ts | *.directive.ts | *.pipe.ts | *.guard.ts | *.interceptor.ts) printf '%s\n' 'angular-patterns' ;;

                *.ts) printf '%s\n' 'typescript-conventions' ;;
            esac
            ;;
        bash)
            # The branches go by a call check, not by a substring match: a mention of a command is
            # not a command, and the gate refused its own text about a commit.
            if rt_gate_invokes "$target" "git[[:space:]]+(commit|push|merge|rebase|cherry-pick)" \
                || rt_gate_invokes "$target" "git[[:space:]]+worktree[[:space:]]+(add|remove)" \
                || rt_gate_invokes "$target" "git[[:space:]]+checkout[[:space:]]+-b" \
                || rt_gate_invokes "$target" "git[[:space:]]+switch[[:space:]]+-c" \
                || rt_gate_invokes "$target" "(gh|glab)[[:space:]]+(pr|mr|issue)[[:space:]]+(create|merge|edit)" \
                || rt_gate_invokes "$target" "az[[:space:]]+(repos|boards)" \
                || rt_gate_invokes "$target" "[^[:space:]]*task:new" \
                || rt_gate_invokes "$target" "prisma[[:space:]]+(migrate|db)"; then
                printf '%s\n' 'git-workflow'
            # An edit of the PR body through the hosting client is caught by two signs at once — the
            # client call AND the request address. One word about the PR is not enough: it lands in
            # the line of any command that writes about it. No check reads the PR body, and a
            # statement about the tree goes stale in it silently.
            elif rt_gate_invokes "$target" "(gh|glab)[[:space:]]+api" \
                && printf '%s' "$target" | grep -qE '(-X|--method)[[:space:]]+(PATCH|PUT).*(pulls|merge_requests)/[0-9]+'; then
                printf '%s\n' 'git-workflow'
            # Images and the registry on the owner's machine: the owner's own stands and the work of
            # their other branches lie there too. Removal and cleanup matter more than the build —
            # they carry away someone else's for good. Read commands stay outside the gate: they are
            # what a shortage of space is investigated with, and demanding a rule for them would
            # refuse the very technique. So the general cleanup is caught with `prune`.
            elif rt_gate_invokes "$target" "docker[[:space:]]+(build|buildx|pull|push|run|compose|login|rm|rmi|stop|start|restart|image|volume|builder|network)" \
                || rt_gate_invokes "$target" "docker[[:space:]]+system[[:space:]]+prune"; then
                printf '%s\n' 'git-workflow'
            fi

            # The task body and the PR body are published by a client call and never become a file
            # of the tree: the gate checked the extension of the edited file and stayed silent on
            # such a command. A person reads this text, and more often than any file of the tree:
            # the owner read seven of their tasks and two PRs and called the language in them
            # unreadable, and not one check reported it. Two signs at once: the client call and the
            # body in the arguments — one word about the PR is not enough, it is in the line of any
            # command that writes about it.
            if { rt_gate_invokes "$target" "(gh|glab)[[:space:]]+(pr|mr|issue)[[:space:]]+(create|edit)" \
                || rt_gate_invokes "$target" "[^[:space:]]*task:new"; } \
                && printf '%s' "$target" | grep -qE '(--body|--body-file|--description|-F[[:space:]]*body)'; then
                printf '%s\n' 'doc-style'
                printf '%s\n' 'doc-style-human'
            fi

            # The PR merge is the last moment when the folder of a closed task can still be taken
            # apart by the same PR: after the merge the queue audit sees it, and there is nobody
            # left to answer for it. Required as the SECOND layer, on top of the delivery rule.
            rt_gate_invokes "$target" "(gh[[:space:]]+pr|glab[[:space:]]+mr)[[:space:]]+merge" \
                && printf '%s\n' 'task-flow'

            # A request to a running application: what lies here is not the code but what answers on
            # the port. The reply of the previous session's build is indistinguishable from the
            # reply of the live branch. Both signs are needed — the client call AND the address: the
            # address alone is not enough, it lands in the line of any command that writes about it,
            # and the gate refused the check of the gate itself. The port is not listed: a one-off
            # stand of one's own is raised on any free one.
            if printf '%s' "$target" | grep -qE '(localhost|127\.0\.0\.1):[0-9]{4,5}' \
                && { rt_gate_invokes "$target" curl || rt_gate_invokes "$target" wget; }; then
                printf '%s\n' 'browser-verification'
            fi
            ;;
        # The check through the browser is the only area where the rule is needed not for a file
        # edit but for a tool: what lies there is not the files but the stand and the coordinates.
        browser) printf '%s\n' 'browser-verification' ;;
    esac

    return 0
}

# Without a project override the map is the default. With an override it will declare `skill_for`
# anew.
skill_for() {
    skill_for_default "$@"
}

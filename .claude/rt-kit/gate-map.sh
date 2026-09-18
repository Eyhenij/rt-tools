#!/usr/bin/env bash
# The gate map override: what the other trees of the workshop do not have.
#
# The default is brought by the package — `.claude/rt-kit/defaults/gate-map.sh`: the tests, the
# components, the styles, the barrels, the manifests, the documents and the delivery commands are
# sorted out there. What stays here is this tree's own: the showcase, which has a rule of this
# tree; the barrels with the ng-packagr manifests; the receiver with its admin panel — and what a
# consumer tree does not have at all. The rules package is written here rather than only
# installed, so its source and the laid-out copies are sorted out by branches of their own: the
# source texts lead to the layers' structure, the executable to editing the source, the laid-out
# and the overrides to the layout.
#
# Two more branches mend the default where its sign is wider than its subject: a spec of code
# without a showing does not go to the component check rule, and the key of one's own edition in
# the manifest is not read as a dependency.
#
# The function prints the RULE NAME or stays silent. Silence means "there is no rule for this",
# and the gate lets the edit through.
#
# The order of the branches decides: the first match wins, so the specific goes before the
# general. A showcase file and a test file are not component files, and both branches must stand
# before the general extension branch, and one's own specific before the call of the default.

skill_for() {
    kind="$1"
    target="$2"
    written="$3"

    case "$kind" in
        edit)
            case "$target" in
                # The roles, the commands, the settings and the session handover: the rule for
                # them is the thing itself.
                */.claude/agents/* | */.claude/commands/* | */.claude/workflows/* | */.claude/settings*.json | */.claude/handoff/* | */.claude/rt-kit/proposals/*)
                    return 0
                    ;;

                # A laid-out copy of a rule: it is edited not here but in the package source, and
                # the layout rule says so. Before, the whole helper directory was covered by one
                # silent branch, and the copies with their overrides were edited under no rule.
                */.claude/skills/*)
                    printf '%s\n' 'agent-kit'
                    return 0
                    ;;

                # The hooks, the overrides and the tree's traits: what the layout here differs
                # from the package one by. The layout rule names both the place of an edit and
                # the order of the build.
                */.claude/hooks/* | */.claude/rt-kit/*)
                    printf '%s\n' 'agent-kit-extend'
                    return 0
                    ;;

                */.claude/*) return 0 ;;

                # A spec of code without a showing. The branch stands before the general
                # `*.spec.ts`, which gives a spec to the component check rule: the node's code has
                # no showcases, no snapshots and no layout measurements, and out of forty-odd
                # kilobytes of that rule it needs one line.

                # A check of the tree and the cases next to it fall here too: the verifiability
                # rule holds everything such a check is written by — its place in the gate and in
                # the pipeline, the shape of its accepted list, the fail-open of a guard — while
                # the default leads neither the check nor a shell case file to any rule at all.
                */projects/agent-kit/*.spec.ts | */tools/*.spec.ts | */tools/*.test.ts | */tools/*.test.sh | */tools/tests/* | */tools/check-*.mjs)
                    printf '%s\n' 'testing'
                    return 0
                    ;;

                # The source texts of the rules package. The default sorts them out by the file
                # name and takes an edit of a check to that check's rule, and a law and a rule to
                # the wording rule: the layers' structure is not loaded at all then.
                */projects/agent-kit/assets/laws/* | */projects/agent-kit/assets/rules/* | */projects/agent-kit/assets/patterns/* | */projects/agent-kit/assets/skills/*)
                    printf '%s\n' 'spec-driven'
                    printf '%s\n' 'agent-kit-source'
                    return 0
                    ;;

                # The executable part of the package source: the hooks, the checks, the defaults,
                # the roles, the samples. It is edited here, and it reaches a tree only by a build
                # and a layout.
                */projects/agent-kit/assets/* | */projects/agent-kit/tests/*)
                    printf '%s\n' 'agent-kit-source'
                    return 0
                    ;;

                # The manifest. The default judges it by one pattern over the pair "name — version
                # number", and it catches the key of one's own edition on a par with a dependency:
                # a version raise loaded the rule about foreign versions. One's own edition is
                # delivery.
                */package.json)
                    if printf '%s' "$written" | grep -qE '"(dependencies|devDependencies|peerDependencies|optionalDependencies|overrides|resolutions|packageManager)"'; then
                        printf '%s\n' 'dependencies'
                    elif printf '%s' "$written" | grep -oE '"[^"]+"[[:space:]]*:[[:space:]]*"[~^]?[0-9]+\.[0-9]+' | grep -qvE '^"version"'; then
                        printf '%s\n' 'dependencies'
                    elif printf '%s' "$written" | grep -qE '"version"[[:space:]]*:'; then
                        printf '%s\n' 'git-workflow'
                    fi
                    return 0
                    ;;

                # The generated storage client: the generator rewrites it whole, and there is
                # nobody to argue with it about techniques.
                */persistence/util/src/generated/*) return 0 ;;

                # The admin panel's end-to-end suite. Its specs go the user's path and live on the
                # stand: they are edited by the shared verifiability rule together with the stand
                # rule, not by the rule of a kit component's spec. The branch stands before the
                # general `*.spec.ts` and before the server one: their file names are the same.
                */apps/message-bus-admin-e2e/*)
                    printf '%s\n' 'testing'
                    printf '%s\n' 'browser-verification'
                    return 0
                    ;;

                # The server side. The front-end rules do not act on it — they say so themselves —
                # and the receiver's spec is run by the shared verifiability rule rather than by
                # the kit's rule. The branches stand before the general ones: the receiver's files
                # carry the same name suffixes.
                */apps/message-bus/*.spec.ts | */libs/message-bus*/*.spec.ts)
                    printf '%s\n' 'testing'
                    return 0
                    ;;
                # The receiver's access guard: the refusal without a sign-in and without a right is
                # held by it, and the access rule is bound here. The branch stands before the
                # general server one.
                */libs/message-bus-api/access/*)
                    printf '%s\n' 'permissions'
                    return 0
                    ;;

                # The admin panel. Its libs lie in the family `libs/message-bus-admin`, and the
                # general server branch below would take them for itself: the names begin the same
                # way. The specific goes first.

                # The admin panel's route guard: it is the refusal without a sign-in here.
                */libs/message-bus-admin/*.guard.ts)
                    printf '%s\n' 'permissions'
                    printf '%s\n' 'angular-patterns'
                    return 0
                    ;;

                # The rest of the sign-in keeps no records: it has neither an edit panel nor an
                # entity model, and there is nothing to demand the entity rules on it for. The
                # branch takes it to the default before the branches of the stores and the models
                # reach it.
                */libs/message-bus-admin/auth/*)
                    command -v skill_for_default >/dev/null 2>&1 && skill_for_default "$kind" "$target" "$written"
                    return 0
                    ;;

                # The section's list screen.
                */libs/message-bus-admin/*/feature/list/*)
                    printf '%s\n' 'lists'
                    return 0
                    ;;

                # The menu, the shell and the section addresses: a menu item and a route are
                # created by one declaration, and one rule edits them both.
                */libs/message-bus-admin/common/container/* | */libs/message-bus-admin/*.routes.ts | */apps/message-bus-admin/src/app/app.routes.ts)
                    printf '%s\n' 'navigation'
                    return 0
                    ;;

                # An entity's store and its edit panel.
                */libs/message-bus-admin/*.store.ts | */libs/message-bus-admin/*/feature/*-aside/*)
                    printf '%s\n' 'entity-conventions'
                    printf '%s\n' 'angular-patterns'
                    return 0
                    ;;

                # A record's model and its mapper — what is queried on the screen and what it is
                # translated by.
                */libs/message-bus-admin/*.model.ts | */libs/message-bus-admin/*.mapper.ts | */libs/message-bus-common/*.model.ts | */libs/message-bus-common/*.mapper.ts)
                    printf '%s\n' 'entity-models'
                    return 0
                    ;;

                */apps/message-bus/* | */libs/message-bus*/*)
                    printf '%s\n' 'typescript-conventions'
                    return 0
                    ;;

                # The kits' styling: the package rule speaks by the law's technique, one's own by
                # the tokens, the theme handles, the narrow-screen threshold and the cascade layers
                # of this tree. A pair, not a choice: the technique cannot be applied without the
                # names, and the names cannot be explained without the technique.
                *.scss | *.css)
                    printf '%s\n' 'styling-bem'
                    printf '%s\n' 'rt-tools-styling'
                    return 0
                    ;;

                # The cargo mark command: it is edited by whoever sorts the cargo out, and the
                # order of the sorting out must be known before the edit. The rule is the tree's
                # own: a consumer tree has no intake at all, and the package does not carry it.
                # The boundary debt list stood here too while it was alive; created anew, it comes
                # back to this branch.
                */tools/cargo-mark.mjs)
                    printf '%s\n' 'cargo-triage'
                    return 0
                    ;;

                # The snapshot harness, the reference images, the runner and the story sweep: the
                # showcase rule is about the shape of a story, not about checking a frame — here
                # the component check rule leads.
                */.storybook/test-runner.ts | */__snapshots__/* | */tools/visual-snapshots-v2.mjs | */tools/story-sweep-v2.mjs)
                    printf '%s\n' 'ui-component-tests'
                    return 0
                    ;;

                # The rest of the showcase settings: the providers, the order of the sidebar, the
                # set of stories. Neither the linter nor the typecheck looks here at all — the only
                # check here is reading.
                */.storybook/*.ts)
                    printf '%s\n' 'rt-tools-storybook'
                    return 0
                    ;;

                # The harness of the showing: the grids, the rows, the themes, the snapshot
                # parameters. This is the showcase's demonstration code rather than the
                # application's components — the same rule leads it as the stories.
                */src/showcase/*)
                    printf '%s\n' 'rt-tools-storybook'
                    return 0
                    ;;

                # The markup of the ready-made component set. Inside the kit nothing catches the
                # bypassing of the ready-made: the sign set is aimed at a consumer, and the
                # uniformity rule's gate did not demand it here. One's own markup instead of the
                # neighbouring ready-made component travelled into a branch that way — the owner
                # found it at a showing. The default is called next: the component markup rule is
                # not lifted from here.
                */projects/*/src/lib/ui-kit/*.html)
                    printf '%s\n' 'reuse-first'
                    command -v skill_for_default >/dev/null 2>&1 && skill_for_default "$kind" "$target" "$written"
                    return 0
                    ;;

                # The showcase: it has a rule of this tree, and the package carries none. The
                # branch stands after the snapshot harness and before the general one: a story
                # file is not a component file.
                *.stories.ts | */stories/*.ts | */strories/*.ts | *.mdx)
                    printf '%s\n' 'rt-tools-storybook'
                    return 0
                    ;;

                # A component's spec: the default has the shared verifiability rule for it, while
                # the ready-made spec code and the order of checking lie in this tree's rule.
                *.spec.ts)
                    printf '%s\n' 'ui-component-tests'
                    return 0
                    ;;

                # The package's published surface: the default has none — the barrels are called
                # differently there, and there is no ng-packagr manifest at all.
                */public-api.ts | */ng-package.json)
                    printf '%s\n' 'lib-layers'
                    return 0
                    ;;
            esac
            ;;
    esac

    # Everything else is sorted out by the package default: the tests, the components, the styles,
    # the barrels, the documents. The check for the declaration is needed in exactly one gap: the
    # package is updated while `sync` has not been run in this tree yet, and the default is not on
    # the disk. Without it the gate would stay silent on everything at once.
    command -v skill_for_default >/dev/null 2>&1 && skill_for_default "$kind" "$target" "$written"

    return 0
}

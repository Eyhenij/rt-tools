#!/usr/bin/env bash
# The part of this tree's profile about its heavy steps: which steps count as heavy, and which specs
# of the admin panel's end-to-end suite a branch pays for. It is read by `project.sh` next to it,
# where the set before a push is assembled; it stands apart because that file is at the length
# limit.

# The heavy steps of this tree past the package default: the showcase snapshots raise a showcase
# and shoot it, minutes each, and the package does not know their name. The auth stand raises
# three containers and waits for Keycloak.
rt_push_check_heavy() {
    case "$1" in *visual-gate* | *serve:auth*) return 0 ;; esac

    rt_push_check_heavy_default "$1"
}

# The admin end-to-end step a branch pays for: the whole suite, or only the specs of the sections
# its code reaches. The suite holds 168 tests, and an edit of one section ran all of them: the step
# went over its time limit on a branch that needed 19 (RT-3287).
#
# A section is named here only when it is known which specs walk it. Every other path of the
# receiver and of the admin runs the whole suite: an unknown path reads as "it could have touched
# any screen". A unit spec is not built into an application and calls for no end-to-end spec; a
# changed end-to-end spec calls for itself. No base, or a diff that cannot be read, runs the whole
# suite.
#
# The usage code serves two sections: the controller and the admin libraries of «Использование»
# also read and draw «Качество», so an edit there pays for the specs of both.
rt_admin_e2e_step() {
    local full='pnpm exec nx run message-bus-admin-e2e:e2e' changed specs='' f add spec
    local usage='src/usage-section.spec.ts src/quality-section.spec.ts src/quality.narrow.spec.ts'
    local quality='src/quality-section.spec.ts src/quality.narrow.spec.ts'

    changed="$(git diff --no-renames --name-only "$1"..."${2:-HEAD}" 2>/dev/null)" || changed=''
    if [ -z "$changed" ]; then
        printf '%s\n' "$full"

        return 0
    fi

    for f in $changed; do
        case "$f" in
            # The browser script of the step itself runs every spec.
            tools/shot-browser* | tools/shot-forward.mjs) add='all' ;;
            docs/*|*.md|.claude/*|projects/agent-kit/*|tools/*|graphify-out/*|*/graphify-out/*|.prettierignore) add='' ;;
            apps/message-bus-admin-e2e/src/*.spec.ts) add="${f#apps/message-bus-admin-e2e/}" ;;
            libs/message-bus-*.spec.ts) add='' ;;
            libs/message-bus-admin/usage/*|libs/message-bus-api/observations/*/usage*) add="$usage" ;;
            libs/message-bus-api/observations/*/quality*) add="$quality" ;;
            *) add='all' ;;
        esac

        if [ "$add" = 'all' ]; then
            printf '%s\n' "$full"

            return 0
        fi

        for spec in $add; do
            case " $specs " in *" $spec "*) ;; *) specs="${specs}${specs:+ }$spec" ;; esac
        done
    done

    if [ -z "$specs" ]; then
        printf '%s\n' "$full"

        return 0
    fi

    printf '%s -- %s\n' "$full" "$specs"
}

# The paths a step of the set reads, for the steps the table of reads does not record: a line per
# path. The metrics report counts a run idle when the change touched none of them.
#
# The package hook scenarios read the hooks, the checks and the scenarios of the package, not the
# whole package: a branch that edits only the library code, a README or a spec runs them for
# nothing, eleven to nineteen minutes a run. The lint, types, tests and build of `nx affected` read
# the project roots and the root settings every project depends on: a branch of texts and rules
# alone runs them idle. The heavy steps of `rt_push_checks` are printed only for a branch that
# touched their subject, so their subject is the whole tree. A step named here by nothing has no
# subject of paths, and the report says so.
rt_push_subject() {
    case "$1" in
        *'nx affected -t test-hooks'*) printf '%s\n' projects/agent-kit/assets projects/agent-kit/tests ;;
        *'nx affected -t lint typecheck test build'*)
            printf '%s\n' projects apps libs tools prisma eslint package.json pnpm-lock.yaml nx.json \
                tsconfig.base.json eslint.config.mjs jest.config.ts jest.preset.cjs vitest.workspace.ts project.json
            ;;
        *e2e* | *visual-gate* | *'docker build'* | *serve:auth*) printf '.\n' ;;
    esac
    return 0
}

#!/usr/bin/env bash
# rt-kit v0.25.0 · templates/gate-map.sh · 2cfb6730a990 · правится надстройкой, не здесь
# Gate map override: what the workshop's other trees do not have.
#
# Copy to `.claude/rt-kit/gate-map.sh` and add your own. The file is optional: without it the
# package default applies — `.claude/rt-kit/defaults/gate-map.sh`, where tests, components,
# styles, barrels, manifests, documents and delivery commands are already handled.
#
# This override is worth starting exactly when the tree has a kind of file the others lack: a
# showcase, its own generator, a foreign directory layout.
#
# The function prints the RULE NAME or stays silent. There may be several names, one per line.
# The order of branches decides: the first match wins, so the specific goes before the general —
# and your own specific branch must stand BEFORE the call of the default, otherwise the general
# branch of the extension intercepts it.

skill_for() {
    kind="$1"
    target="$2"
    written="$3"

    case "$kind" in
        edit)
            case "$target" in
                # Sample: the showcase has a rule of its own, the package ships none.
                # *.stories.ts | *.mdx) printf '%s\n' '<правило витрины>' ; return 0 ;;

                # Sample: a domain edited under a rule of its own.
                # */libs/<домен>/*) printf '%s\n' '<правило домена>' ; return 0 ;;
                *) ;;
            esac
            ;;
        bash)
            case "$target" in
                # Sample: a deployment command of your own.
                # *<команда>*) printf '%s\n' '<правило>' ; return 0 ;;
                *) ;;
            esac
            ;;
    esac

    # Everything the tree did not name its own is handled by the package default. The check for
    # the declaration is needed in exactly one gap: the package is updated, and `sync` has not
    # yet been run in this tree.
    command -v skill_for_default >/dev/null 2>&1 && skill_for_default "$kind" "$target" "$written"

    return 0
}

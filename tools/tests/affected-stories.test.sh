#!/usr/bin/env bash
# The scenarios of the touched stories: which story files an edit reaches and when it is everything.
#
# A one-off kit with three story files. `card` draws itself through a barrel, a template and a style;
# `chart` takes a neighbour package and an `import()`; `plain` takes nothing. An edit the command
# judges wrongly lets a broken frame through the branch's set in silence, so every rule has a case
# where it must answer «everything».
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the touched stories"

WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

KIT=projects/ui-kit-v2
CARD=$KIT/src/lib/components/card
CHART=$KIT/src/lib/components/chart
PLAIN=$KIT/src/lib/components/plain
BOOK=$KIT/.storybook

cd "$WORK" || exit 1

put() {
    mkdir -p "$(dirname "$1")"
    printf '%s\n' "${@:2}" > "$1"
}

save() {
    git add -A && git -c user.name=t -c user.email=t@t -c commit.gpgsign=false commit -q -m "$1" --allow-empty
}

git init -q -b main .

put package.json '{ "dependencies": { "quill": "2.0.0" } }'
put tsconfig.base.json '{' '  // the aliases' '  "compilerOptions": { "paths": {' \
    '    "@rt-tools/core": ["projects/core/src/index.ts"],' \
    '    "@rt-tools/ui-kit-v2": ["projects/ui-kit-v2/src/public-api.ts"],' \
    '    "@rt-tools/ui-kit-v2/*": ["projects/ui-kit-v2/src/lib/components/*/index.ts"]' '  } }' '}'
put projects/core/src/index.ts "export * from './lib/bem.js';" "export * from './lib/sort';"
put projects/core/src/lib/bem.ts 'export const bem: string = "b";'
put projects/core/src/lib/sort.ts 'export const sort: string = "s";'
put projects/core/package.json '{' '    "name": "@rt-tools/core",' '    "version": "1.0.0",' '    "peerDependencies": {}' '}'
put projects/cms-server/src/index.ts 'export const cms: number = 1;'
put projects/cms-server/package.json '{ "name": "cms" }'
put $KIT/ng-package.json '{}'
put $KIT/tsconfig.lib.json '{}'
put $KIT/src/public-api.ts "export * from './lib/components/card';" "export * from './lib/components/plain';"
put $KIT/src/styles/_form.scss '.form { color: red; }'
put $KIT/src/styles/_unread.scss '.unread { color: red; }'
put $KIT/src/styles/_index.scss "@use 'form';"
put $KIT/src/assets/icons/one.svg '<svg></svg>'
put $KIT/src/lib/i18n/rt-kit-labels.en.ts 'export const RT_KIT_LABELS_EN = {' "    uiOne: 'One'," '} as const;'
put $KIT/src/showcase/story-snapshot.ts 'export const VIEW: number = 1;'
put $BOOK/preview.ts "import { PROVIDER } from '../src/lib/provider';" "import { RU } from './showcase-labels.ru';" 'export default { PROVIDER, RU };'
put $BOOK/showcase-labels.ru.ts "import { RT_KIT_LABELS_EN } from '../src/lib/i18n/rt-kit-labels.en';" 'export const RU: Record<keyof typeof RT_KIT_LABELS_EN, string> = {' "    uiOne: 'Один'," '};'
put $BOOK/test-runner.ts "import { VIEW } from '../src/showcase/story-snapshot.ts';" 'export default VIEW;'
put $BOOK/main.ts 'export default {};'
put $BOOK/storybook.scss "@use '../src/styles/index';"
put $BOOK/vendor.scss "@import 'quill/dist/quill.snow.css' layer(vendor);"
put $BOOK/__snapshots__/atoms-card--base.png png
put $BOOK/__snapshots__/atoms-card--base--w480.png png
put $KIT/src/lib/provider.ts 'export const PROVIDER: string = "p";'

put $CARD/index.ts "export { RtCard as Card } from './card.component';" "export * from './card.unused';"
put $CARD/card.component.ts "import { rtText } from './card.text';" "import { RT_KIT_LABELS_EN } from '../../i18n/rt-kit-labels.en';" \
    "@Component({ templateUrl: './card.component.html', styleUrls: ['./card.component.scss'] })" 'export class RtCard { rtText = rtText; labels = RT_KIT_LABELS_EN; }'
put $CARD/card.text.ts 'export const rtText: string = "t";'
put $CARD/card.unused.ts 'export const unused: number = 1;'
put $CARD/card.component.html '<p></p>'
put $CARD/card.component.scss '@use "parts";' '// @use "gone";'
put $CARD/_parts.scss '.parts { color: red; }'
put $CARD/stories/card.stories.ts "import { Card } from '@rt-tools/ui-kit-v2/card';" 'export default { title: "Atoms/Card", component: Card };'

put $CHART/index.ts "export * from './chart.component';"
put $CHART/chart.component.ts "import { bem } from '@rt-tools/core';" "import * as helpers from './helpers';" \
    "@Component({ template: '', styleUrl: './chart.component.scss' })" "export class RtChart { x = bem; h = helpers; load = () => import('./lazy'); }"
put $CHART/chart.component.scss '.chart { color: red; }'
put $CHART/helpers.ts "export * from './helper-one';"
put $CHART/helper-one.ts 'export const one: number = 1;'
put $CHART/lazy.ts 'export const lazy: number = 1;'
put $CHART/stories/chart.stories.ts "import { RtChart } from '../index';" 'export default { title: "Organisms/Chart", component: RtChart };'

put $PLAIN/index.ts "export * from './plain';"
put $PLAIN/plain.ts 'export const plain: number = 1;'
put $PLAIN/stories/plain.stories.ts "import { plain } from '@rt-tools/ui-kit-v2';" 'export default { title: "Atoms/Plain", plain };'

save base

# One edit on a clean copy of the base: the answer is the first line, or the named story files.
answer() {
    node "$TOOLS/affected-stories.mjs" --base main 2>&1
}

back() {
    git reset -q --hard main && git clean -qfd
}

# What an edit of one file gives: `всё`, `нечего` or the short names of the story files.
after() {
    local out
    for path in "$@"; do printf '%s\n' '/* edit */' >> "$path"; done
    out="$(answer)"
    back
    short "$out"
}

after_change() {
    local out
    "$@"
    out="$(answer)"
    back
    short "$out"
}

short() {
    case "$1" in
        'снять: всё'*) printf 'всё' ;;
        'снять: нечего'*) printf 'нечего' ;;
        *) printf '%s\n' "$1" | sed -n 's#.*/\([a-z-]*\)\.stories\.ts$#\1#p' | tr '\n' ' ' | sed 's/ $//' ;;
    esac
}

report "a clean copy touches nothing" "$(short "$(answer)")" 'нечего'
report "a story file touches itself" "$(after $CARD/stories/card.stories.ts)" 'card'
report "the first line counts the story files" "$(printf '\n' >> $CARD/stories/card.stories.ts; answer | head -1; back)" 'снять: 1 из 3'
report "a template touches its component's stories" "$(after $CARD/card.component.html)" 'card'
report "a style touches its component's stories" "$(after $CHART/chart.component.scss)" 'chart'
report "a partial behind @use is found without its underscore" "$(after $CARD/_parts.scss)" 'card'
report "a starred path leads to the barrel" "$(after $CARD/index.ts)" 'card'
report "a named import goes through the barrel to the declaration" "$(after $CARD/card.text.ts)" 'card'
report "a neighbour the barrel gives out is not touched by a named import" "$(after $CARD/card.unused.ts)" 'нечего'
report "an import of a whole module brings all it gives out" "$(after $CHART/helper-one.ts)" 'chart'
report "an import() touches the story" "$(after $CHART/lazy.ts)" 'chart'
report "a neighbour package is reached by its name, .js in place of .ts" "$(after projects/core/src/lib/bem.ts)" 'chart'
report "a file of a reached package nothing draws is no story" "$(after projects/core/src/lib/sort.ts)" 'нечего'

unresolved() { printf '%s\n' "import { gone } from './gone';" >> $PLAIN/plain.ts; }
report "an import that does not resolve is everything" "$(after_change unresolved)" 'всё'
dropped_template() { rm $CARD/card.component.html; }
report "a template that is named and gone is everything" "$(after_change dropped_template)" 'всё'
bare_style() { printf '%s\n' "@use 'nowhere';" >> $CARD/_parts.scss; }
report "a style without a dot that is neither a neighbour nor a package is everything" "$(after_change bare_style)" 'всё'

report "a shared style of the showcase is everything" "$(after $KIT/src/styles/_form.scss)" 'всё'
report "a shared style nothing reads is everything too" "$(after $KIT/src/styles/_unread.scss)" 'всё'
report "a provider of preview.ts is everything" "$(after $KIT/src/lib/provider.ts)" 'всё'
report "what test-runner.ts reads is everything" "$(after $KIT/src/showcase/story-snapshot.ts)" 'всё'
report "a setting of the showcase is everything" "$(after $BOOK/main.ts)" 'всё'

# The label sets: one added line is read by a component the branch edits too.
add_label() {
    perl -pi -e "s/^    uiOne: 'One',/    uiOne: 'One',\n    uiTwo: 'Two',/" $KIT/src/lib/i18n/rt-kit-labels.en.ts
    perl -pi -e "s/^    uiOne: 'Один',/    uiOne: 'Один',\n    uiTwo: 'Два',/" $BOOK/showcase-labels.ru.ts
}
report "an added label is no story" "$(after_change add_label)" 'нечего'
change_label() { perl -pi -e "s/'One'/'First'/" $KIT/src/lib/i18n/rt-kit-labels.en.ts; }
report "a changed label is everything" "$(after_change change_label)" 'всё'
drop_label() { perl -ni -e 'print unless /uiOne/' $BOOK/showcase-labels.ru.ts; }
report "a removed label is everything" "$(after_change drop_label)" 'всё'
report "a line of the label set that is no label is everything" "$(after $KIT/src/lib/i18n/rt-kit-labels.en.ts)" 'всё'

report "a reference touches the story of its title" "$(after $BOOK/__snapshots__/atoms-card--base.png)" 'card'
stray_reference() { put $BOOK/__snapshots__/atoms-gone--base.png png; }
report "a reference without a story file is everything" "$(after_change stray_reference)" 'всё'
drop_story() { rm $PLAIN/stories/plain.stories.ts; }
report "a deleted story file is everything" "$(after_change drop_story)" 'всё'
drop_style() {
    rm $CHART/chart.component.scss
    perl -pi -e "s/, styleUrl: '.\/chart.component.scss'//" $CHART/chart.component.ts
}
report "a deleted style is judged by the component that stopped naming it" "$(after_change drop_style)" 'chart'
drop_unread() {
    rm $CARD/card.unused.ts
    put $CARD/index.ts "export { RtCard as Card } from './card.component';"
}
report "a deleted source nothing draws adds no story of its own" "$(after_change drop_unread)" 'card'
move_to_directory() {
    git mv $PLAIN/plain.ts $PLAIN/next.ts && mkdir $PLAIN/plain && git mv $PLAIN/next.ts $PLAIN/plain/index.ts
}
report "a file that became a directory still touches its readers" "$(after_change move_to_directory)" 'plain'
heir_only() { rm $PLAIN/plain.ts; }
mkdir -p $PLAIN/plain && put $PLAIN/plain/index.ts 'export const plain: number = 2;' && save heir
report "a deleted file whose import falls to a directory touches its readers" "$(after_change heir_only)" 'plain'

report "a text, a spec and an application are no story" \
    "$(put docs/one.md one; put apps/one/main.ts one; put $CARD/card.component.spec.ts one; after $CARD/README.md)" 'нечего'
report "ng-package.json and tsconfig.lib.json are no story" "$(after $KIT/ng-package.json $KIT/tsconfig.lib.json)" 'нечего'
bump() { perl -pi -e 's/"1.0.0"/"1.0.1"/' projects/core/package.json; }
report "a version line of a package is no story" "$(after_change bump)" 'нечего'
peer() { perl -pi -e 's/"peerDependencies": \{\}/"peerDependencies": { "rxjs": "7" }/' projects/core/package.json; }
report "another line of a package manifest is everything" "$(after_change peer)" 'всё'
report "a package the showcase does not reach is no story" "$(after projects/cms-server/package.json projects/cms-server/src/index.ts)" 'нечего'
report "an icon is everything" "$(after $KIT/src/assets/icons/one.svg)" 'всё'
report "a file of the root is everything" "$(after package.json | head -1)" 'всё'
report "a script of the snapshot step is everything" "$(put tools/visual-gate.mjs one; short "$(answer)"; back)" 'всё'
report "another tool is no story" "$(put tools/check-docs.mjs one; short "$(answer)"; back)" 'нечего'
report "an unknown path is everything" "$(put something/new.txt one; short "$(answer)"; back)" 'всё'
report "a new file of the copy is judged before it is committed" "$(put $CARD/stories/card-new.stories.ts 'export default { title: "Atoms/New" };'; short "$(answer)"; back)" 'card-new'

report "a base that does not read is everything" "$(short "$(node "$TOOLS/affected-stories.mjs" --base no-such-ref)")" 'всё'
report "a call without a base is everything" "$(short "$(node "$TOOLS/affected-stories.mjs")")" 'всё'
report "an unknown argument is a refusal" "$(node "$TOOLS/affected-stories.mjs" --bass main >/dev/null 2>&1; printf '%s' $?)" '2'

# `--head` reads the files of the commit, not of the copy: the copy here stands at the base.
git checkout -q -b work && printf '%s\n' '/* edit */' >> $CARD/card.component.scss && save work && git checkout -q main
report "--head is judged by its own files" "$(short "$(node "$TOOLS/affected-stories.mjs" --base main --head work)")" 'card'
# The base that went on after the branch left it adds nothing to the branch's answer.
printf '%s\n' '/* edit */' >> $CHART/lazy.ts && save ahead
report "what the base did after the branch left is not the branch's" "$(short "$(node "$TOOLS/affected-stories.mjs" --base main --head work)")" 'card'

suite_result "affected-stories"

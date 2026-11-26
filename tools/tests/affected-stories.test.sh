#!/usr/bin/env bash
# The scenarios of the touched stories: which story files an edit reaches and when it is everything.
# Covers SC-UKV-1873 and SC-UKV-1874 of the spec `docs/specs/ui-kit-v2/snapshots`.
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

# What the graph cannot follow is everything: it names no file an edit could be looked for in.
lost_by() {
    local file="$1"
    shift
    printf '%s\n' "$@" >> "$file"
    short "$(answer)"
    back
}
report "a lost alias is everything" "$(lost_by $PLAIN/plain.ts "import { x } from '@rt-tools/ui-kit-v2/gone';")" 'всё'
report "a lost export is everything" "$(lost_by $PLAIN/plain.ts "export * from './gone';")" 'всё'
report "a lost import() is everything" "$(lost_by $PLAIN/plain.ts "import('./gone');")" 'всё'
report "an import() of a variable is everything" "$(lost_by $PLAIN/plain.ts 'import(where);')" 'всё'
report "a lost require is everything" "$(lost_by $PLAIN/plain.ts "require('./gone');")" 'всё'
report "a template named by a constant is everything" "$(lost_by $PLAIN/plain.ts '@Component({ templateUrl: TPL }) class X {}')" 'всё'
report "a template named by a shorthand is everything" "$(lost_by $PLAIN/plain.ts '@Component({ templateUrl }) class X {}')" 'всё'
report "a style named by a constant in a list is everything" "$(lost_by $PLAIN/plain.ts '@Component({ styleUrls: [CSS] }) class X {}')" 'всё'
report "a worker named by a constant is everything" "$(lost_by $PLAIN/plain.ts 'new Worker(new URL(W, import.meta.url));')" 'всё'
report "a style loaded by a variable is everything" "$(lost_by $CARD/_parts.scss '@include meta.load-css($theme);')" 'всё'
report "an import from the root of the tree that is lost is everything" "$(lost_by $PLAIN/plain.ts "import { x } from 'projects/gone';")" 'всё'
report "an outside module is no lost import" "$(lost_by $PLAIN/plain.ts "import { x } from '@angular/core';" "import q from 'quill';")" 'plain'

# One source named by every form the graph follows: the edit of the source touches the story of `plain`.
named_by() {
    local file="$1" source="$2" line="$3" out
    put "$source" "${4:-export const one: number = 1;}"
    printf '%s\n' "$line" >> "$file"
    save named
    printf '%s\n' '/* edit */' >> "$source"
    out="$(node "$TOOLS/affected-stories.mjs" --base HEAD)"
    git reset -q --hard HEAD~1 && git clean -qfd
    short "$out"
}
NEXT=$PLAIN/next.ts
report "a default import is followed" "$(named_by $PLAIN/plain.ts $NEXT "import one from './next';")" 'plain'
report "a namespace import is followed" "$(named_by $PLAIN/plain.ts $NEXT "import * as one from './next';")" 'plain'
report "an import of the file alone is followed" "$(named_by $PLAIN/plain.ts $NEXT "import './next';")" 'plain'
report "an import of no names is followed" "$(named_by $PLAIN/plain.ts $NEXT "import {} from './next';")" 'plain'
report "a name the barrel does not declare brings the whole barrel" "$(named_by $PLAIN/plain.ts $NEXT "import { absent } from './next';")" 'plain'
report "an import from the root of the tree is followed" "$(named_by $PLAIN/plain.ts $NEXT "import { one } from 'projects/ui-kit-v2/src/lib/components/plain/next';")" 'plain'
report "a require is followed" "$(named_by $PLAIN/plain.ts $NEXT "require('./next');")" 'plain'
report "a worker is followed" "$(named_by $PLAIN/plain.ts $NEXT "new Worker(new URL('./next.ts', import.meta.url));")" 'plain'
report "a template in quotes of its name is followed" "$(named_by $PLAIN/plain.ts $PLAIN/next.html "@Component({ 'templateUrl': './next.html' }) class X {}" '<p></p>')" 'plain'
report "a story given out from a neighbour is followed" "$(named_by $PLAIN/stories/plain.stories.ts $PLAIN/stories/base.ts "export { one } from './base';")" 'plain'
report "a story given out whole from a neighbour is followed" "$(named_by $PLAIN/stories/plain.stories.ts $PLAIN/stories/base.ts "export * from './base';")" 'plain'
report "what preview.ts gives out is everything" "$(named_by $BOOK/preview.ts $KIT/src/showcase/base.ts "export { one } from '../src/showcase/base';")" 'всё'
report "what vendor.scss takes is everything" "$(named_by $BOOK/vendor.scss $KIT/src/showcase/_base.scss "@use '../src/showcase/base';" '.x { color: red; }')" 'всё'
report "what main.ts takes is everything" "$(named_by $BOOK/main.ts $KIT/src/showcase/base.ts "import '../src/showcase/base';")" 'всё'
report "a style by @import is followed" "$(named_by $CARD/_parts.scss $CARD/_next.scss "@import 'next';" '.x { color: red; }')" 'card'
report "the second path of one @import is followed" "$(named_by $CARD/_parts.scss $CARD/_next.scss "@import 'parts', 'next';" '.x { color: red; }')" 'card'
report "a style by @forward is followed" "$(named_by $CARD/_parts.scss $CARD/_next.scss "@forward 'next' show x;" '.x { color: red; }')" 'card'
report "a style by load-css is followed" "$(named_by $CARD/_parts.scss $CARD/_next.scss "@include meta.load-css('next');" '.x { color: red; }')" 'card'
report "a comment that holds the sign of the other kind hides no style" \
    "$(named_by $CARD/_parts.scss $CARD/_next.scss "$(printf '// components/*.scss\n@use "next";\n/* end */')" '.x { color: red; }')" 'card'
report "a style by @use without a space is followed" "$(named_by $CARD/_parts.scss $CARD/_next.scss '@use"next";' '.x { color: red; }')" 'card'
# A variable: the bash of macOS expands braces with a comma inside a quoted substitution.
OWN_STYLES='@Component({ styles: [`.y {}`, `@use "next";`] }) class X {}'
report "a style the component's own styles take is followed" \
    "$(named_by $PLAIN/plain.ts $PLAIN/_next.scss "$OWN_STYLES" '.x { color: red; }')" 'plain'
report "an address in a style is no comment" \
    "$(named_by $CARD/_parts.scss $CARD/_next.scss "\$x: url(https://a.b/c); @use 'next';" '.x { color: red; }')" 'card'
report "a setting of @use is no path" "$(lost_by $CARD/_parts.scss "@use 'card.component' with (\$a: 'gone');" | tr -d '\n')" 'card'
report "a spec a story takes touches it" "$(named_by $PLAIN/plain.ts $PLAIN/fixture.spec.ts "import './fixture.spec';")" 'plain'

# The longest alias wins: the starred one would lead to another file.
report "an exact alias wins over the starred one" "$(
    perl -pi -e 's#"\@rt-tools/ui-kit-v2/\*"#"\@rt-tools/ui-kit-v2/plain-core": ["projects/ui-kit-v2/src/lib/components/plain/exact.ts"],\n    "\@rt-tools/ui-kit-v2/*"#' tsconfig.base.json
    named_by $PLAIN/plain.ts $PLAIN/exact.ts "import { one } from '@rt-tools/ui-kit-v2/plain-core';"
    back
)" 'plain'

report "a title under as and satisfies is read" "$(
    put $PLAIN/stories/plain.stories.ts 'export default { title: "Atoms/Wrapped" } as Meta satisfies Meta;'
    put $BOOK/__snapshots__/atoms-wrapped--base.png png
    short "$(answer)"
    back
)" 'plain'
report "a reference of a title two files share touches both" "$(
    put $CARD/stories/card-matrix.stories.ts 'export default { title: "Atoms/Card" };'
    save both
    rm $BOOK/__snapshots__/atoms-card--base.png
    short "$(node "$TOOLS/affected-stories.mjs" --base HEAD)"
    git reset -q --hard HEAD~1 && git clean -qfd
)" 'card-matrix card'
report "a setting of the showcase nothing imports is everything" "$(put $BOOK/test-runner-jest.config.js one; short "$(answer)"; back)" 'всё'

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
double_label() { perl -pi -e "s/^    uiOne: 'Один',/    uiOne: 'Один',\n    uiOne: 'Другой',/" $BOOK/showcase-labels.ru.ts; }
report "an added label of a taken key is everything" "$(after_change double_label)" 'всё'
mode_only() { chmod +x $BOOK/showcase-labels.ru.ts; }
report "a label set without a changed line is everything" "$(after_change mode_only)" 'всё'
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
style_heir() {
    put "$1" '.parts { color: blue; }'
    save heirs
    rm $CARD/_parts.scss
    short "$(node "$TOOLS/affected-stories.mjs" --base HEAD)"
    git reset -q --hard HEAD~1 && git clean -qfd
}
report "a deleted style whose name falls to a directory touches its readers" "$(style_heir $CARD/parts/_index.scss)" 'card'
report "a deleted style whose name falls to another file touches its readers" "$(style_heir $CARD/parts.css)" 'card'
kept_heir() { put $PLAIN/kept.ts 'export const kept: number = 1;'; put $PLAIN/kept/index.ts 'export const kept: number = 1;'; put $PLAIN/index.ts "export * from './plain';" "export * from './kept/index';"; }
report "an edited file is judged by itself, not by the directory of its name" "$(
    kept_heir
    printf '%s\n' "import '../kept/index';" >> $PLAIN/stories/plain.stories.ts
    save kept
    printf '%s\n' '/* edit */' >> $PLAIN/kept.ts
    short "$(node "$TOOLS/affected-stories.mjs" --base HEAD)"
    git reset -q --hard HEAD~1 && git clean -qfd
)" 'нечего'
put $PLAIN/_under.ts 'export const under: number = 1;'
put $PLAIN/_under/index.ts 'export const under: number = 2;'
printf '%s\n' "import './_under';" >> $PLAIN/plain.ts
report "a deleted file of an underscored name falls to its directory" "$(
    save under
    rm $PLAIN/_under.ts
    short "$(node "$TOOLS/affected-stories.mjs" --base HEAD)"
    git reset -q --hard HEAD~1 && git clean -qfd
)" 'plain'
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
report "a file of the root is everything" "$(put nx.json '{}'; short "$(answer)"; back)" 'всё'
report "a git setting of the root is no story" "$(put .gitattributes one; put .husky/pre-push one; short "$(answer)"; back)" 'нечего'
report "what narrows the inputs of a build is everything" "$(put .nxignore one; short "$(answer)"; back)" 'всё'
manifest_mode() { chmod +x projects/core/package.json; }
report "a manifest without a changed line is everything" "$(after_change manifest_mode)" 'всё'
for script in visual-gate visual-snapshots-v2 affected-stories story-graph shot-browser showcase-probe serve-static snapshot-icon-probe; do
    report "the step's script $script is everything" "$(put tools/$script.mjs one; short "$(answer)"; back)" 'всё'
done
report "another tool is no story" "$(put tools/check-docs.mjs one; short "$(answer)"; back)" 'нечего'
report "an unknown path is everything" "$(put something/new.txt one; short "$(answer)"; back)" 'всё'
report "a new file of the copy is judged before it is committed" "$(put $CARD/stories/card-new.stories.ts 'export default { title: "Atoms/New" };'; short "$(answer)"; back)" 'card-new'

report "a base that does not read is everything" "$(short "$(node "$TOOLS/affected-stories.mjs" --base no-such-ref)")" 'всё'
report "a call from a directory of the tree judges the whole tree" \
    "$(printf '%s\n' '/* edit */' >> $CARD/card.component.scss; short "$(cd projects && node "$TOOLS/affected-stories.mjs" --base main)"; back)" 'card'
report "a tree without story files is everything" "$(git rm -q -r $CARD/stories $CHART/stories $PLAIN/stories && save bare; printf one > docs.md; short "$(node "$TOOLS/affected-stories.mjs" --base HEAD)"; git reset -q --hard HEAD~1 && git clean -qfd)" 'всё'
report "a call without a base is everything" "$(short "$(node "$TOOLS/affected-stories.mjs")")" 'всё'
report "an unknown argument is a refusal" "$(node "$TOOLS/affected-stories.mjs" --bass main >/dev/null 2>&1; printf '%s' $?)" '2'

# `--head` reads the files of the commit, not of the copy: the copy here stands at the base.
git checkout -q -b work && printf '%s\n' '/* edit */' >> $CARD/card.component.scss && save work && git checkout -q main
report "--head is judged by its own files" "$(short "$(node "$TOOLS/affected-stories.mjs" --base main --head work)")" 'card'
# The base that went on after the branch left it adds nothing to the branch's answer.
printf '%s\n' '/* edit */' >> $CHART/lazy.ts && save ahead
report "what the base did after the branch left is not the branch's" "$(short "$(node "$TOOLS/affected-stories.mjs" --base main --head work)")" 'card'

suite_result "affected-stories"

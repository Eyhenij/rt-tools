# Plan

**Task:** RT-3644 · **Branch:** RT-3644-kit-preset-loader
**Spec:** `docs/specs/ui-kit-v2/tokens/spec.md`
**Behaviour:** unchanged — вид кита не меняется; добавляется отдельная точка входа со службой, которая подгружает `tokens.scope.css` по слову приложения; слово владельца в эпике RT-3641: «запускай task flow»

## Points

- **A:** приложению, которому `tokens.scope.css` нужен не всегда, остаётся подключать его в страницу целиком или терять значения островов и узлов набора Material.
- **This task reaches:** приложение объявляет адрес файла один раз и либо грузит его до первого кадра (`eager`), либо зовёт `ensure()` в нужный момент; без этого файл в страницу не идёт, а стартовый набор кита не растёт: служба лежит в своей точке входа.
- **Sign:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=projects/ui-kit-v2/src/lib/scope-styles/scope-styles.service.spec.ts` проходит, а `node tools/check-kit-weight.mjs` по-прежнему пишет «331452 байт при пороге 331452».
- **Milestone G of the epic:** пресеты и темы подключаются по требованию.
- **Metric:** нет: ни правило, ни хук, ни проверка не улучшаются

## Task footprint

| What                 | Where                                                   |
| -------------------- | ------------------------------------------------------- |
| Specs (правится)     | `docs/specs/ui-kit-v2/tokens/`                          |
| Code (правится)      | `projects/ui-kit-v2/src/lib/scope-styles/`              |
| Code (правится)      | `projects/ui-kit-v2/scope-styles/`                      |
| Code (правится)      | `tsconfig.base.json`                                    |
| Code (правится)      | `projects/ui-kit-v2/tsconfig.spec.json`                 |
| Code (правится)      | `projects/ui-kit-v2/jest.config.ts`                     |
| Code (правится)      | `knip.json`                                             |
| Documents (правится) | `projects/ui-kit-v2/README.md`                          |

## What counts as done

- Точка входа `@rt-tools/ui-kit-v2/scope-styles` отдаёт `RtScopeStylesService`, токен адреса и `provideRtScopeStyles({ href, eager })`; ни `core`, ни `rtTheme`, ни `ThemeService` о ней не знают.
- Служба вставляет `<link rel="stylesheet" data-rt-scope-styles>` в конец `head` один раз: до вставки она ищет такую ссылку и ссылку на тот же адрес; без адреса не делает ничего; в серверной среде не грузит и не падает; отказ загрузки убирает ссылку и возвращается отказом, повторный `ensure()` пробует снова.
- `eager: true` просит загрузку при старте приложения и ждёт её до первого кадра.
- Набор частей старта потребителя не вырос: порог веса остаётся 331452.
- README называет, кому нужна загрузка (острова темы, узлы набора Material ниже корня, панели кита на странице с набором), три шага приложения и рецепт без хэша имени: файл копируется в ассеты приложения, а не берётся связкой стилей.
- Спека кита называет правило и сценарий.

## Stages

### 1. Загрузчик местных стилей

- **Steps:**
    1. Точка входа смотрит на свой входной файл `src/lib/scope-styles/index.ts`
       Check: `grep -c 'scope-styles/index.ts' projects/ui-kit-v2/scope-styles/ng-package.json` → >= 1
    2. Путь `@rt-tools/ui-kit-v2/scope-styles` назван перед шаблоном компонентов в сборке и в тестах, и точка входа известна проверке неиспользуемого
       Check: `grep -c 'scope-styles' tsconfig.base.json` → >= 1
    3. Спека службы проверяет один вызов, повтор, чужую ссылку на тот же адрес, отсутствие адреса, отказ с повтором, серверную среду и `eager`
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=projects/ui-kit-v2/src/lib/scope-styles/scope-styles.service.spec.ts` → /Tests:\s+\d+ passed, \d+ total/
    4. Сборка кита отдаёт точку входа и называет её в своём описании пакета
       Check: `grep -c '"./scope-styles"' dist/ui-kit-v2/package.json` → >= 1
    5. Спека кита называет правило подгрузки
       Check: `grep -c 'RtScopeStylesService' docs/specs/ui-kit-v2/tokens/spec.md` → >= 1
    6. README описывает три шага приложения и ассеты вместо связки стилей
       Check: `grep -c 'provideRtScopeStyles' projects/ui-kit-v2/README.md` → >= 1
- **Readiness sign:** служба грузит файл один раз, повтор после отказа возможен, стартовый набор кита прежний.
- **Verified by:** спека службы, `pnpm run check:all` (границы, неиспользуемое, сборка) и `node tools/check-kit-weight.mjs`: он подтверждает только, что набор старта не вырос («331452 байт при пороге 331452»). Что ничто из ядра и набора старта не импортирует `scope-styles`, проверяет `grep -rln "lib/scope-styles" projects/ui-kit-v2/src --include=*.ts`: в списке только сами файлы точки входа. Вес потребителям возвращает слитая RT-3643, а эта задача даёт им способ подключать острова по требованию.

## What this work does not do

- Не просит загрузку из `rtTheme`, `ThemeService` и панелей наложения: это тянет службу в `core` и в стартовый вес, а остров можно записать разметкой без директивы.
- Не правит приложения-потребители: ассеты, провайдер и вызов службы — их работа по документации.
- Не меняет файлы токенов и порог веса.
- Не называет службу `rtUsePreset`: файл один, и он про острова и узлы набора, а не про набор целиком.

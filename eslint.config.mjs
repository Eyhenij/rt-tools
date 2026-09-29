import ngTemplate from '@angular-eslint/eslint-plugin-template';
import ngParser from '@angular-eslint/template-parser';
import nx from '@nx/eslint-plugin';
import playwright from 'eslint-plugin-playwright';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import sonarjs from 'eslint-plugin-sonarjs';

import { backendConfig } from './eslint/backend.config.mjs';
import { baseTemplateConfig, baseTypeScriptConfig } from './eslint/base.config.mjs';
import { allBoundaries } from './eslint/boundaries/index.mjs';

// Все правила eslint-plugin-sonarjs на максимально строгом уровне.
// Динамическая сборка из плагина — переживёт минорные апдейты без правки конфига.
const sonarjsStrictRules = Object.fromEntries(Object.keys(sonarjs.rules).map((ruleName) => [`sonarjs/${ruleName}`, 'error']));

export default [
    // Клиент хранилища собирает генератор, и в историю он не едет: править его нечем — правка
    // пропадает на следующей сборке. Выходит он вдобавок не байт в байт: на одной машине
    // первой строкой пустая, на другой нет, и линтер краснел на шестнадцати его файлах у
    // конвейера, оставаясь зелёным у того, кто пушил.
    { ignores: ['**/src/generated/**'] },
    eslintPluginPrettierRecommended,
    baseTypeScriptConfig,
    {
        files: ['**/*.ts'],
        plugins: {
            '@nx': nx,
        },
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    // Форма груза объявлена отправляющей стороной и видна обеим: приёмник берёт
                    // её у источника, а не заводит копию. Тегом это не выражается — у
                    // публикуемых пакетов меток нет вовсе, и заведённая ради одного файла метка
                    // стала бы вторым ответом на вопрос о направлении между пакетами.
                    allow: ['@rt-tools/agent-kit/cargo', '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
                    // Рёбра живут файлами доменов в `eslint/boundaries/domains`, а сюда приезжают
                    // сводом: проверка раскладки читает их модулем и требует, чтобы тег либы был
                    // объявлен там ровно один раз.
                    depConstraints: allBoundaries,
                },
            ],
        },
    },
    {
        // Второй вход пакета второго кита берёт первый по имени пакета: сборщик пакета собирает
        // входы порознь, и относительный путь в первый вход он отвергает. Файл входа лежит не над
        // исходниками, поэтому правило само второй вход не узнаёт — исключение названо здесь.
        files: ['projects/ui-kit-v2/src/rich-editor/**/*.ts'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: ['@rt-tools/ui-kit-v2', '@rt-tools/agent-kit/cargo', '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
                    depConstraints: allBoundaries,
                },
            ],
        },
    },
    {
        files: ['**/*.ts'],
        ignores: ['**/*.spec.ts', '**/*.test.ts'],
        plugins: {
            '@nx': nx,
        },
        rules: {
            '@nx/workspace-require-take-until-destroyed': 'error',
            '@nx/workspace-require-host-bem-block': 'error',
            '@nx/workspace-require-mod-directive-import': 'error',
            '@nx/workspace-require-source-suffix-for-subjects': 'error',
            '@nx/workspace-no-subscribe-in-methods': 'error',
            '@nx/workspace-require-list-store-base': 'error',
            // Двухступенчатое приведение отключает проверку типа намеренно:
            // одноступенчатое компилятор ещё сверяет на совместимость, двойное — нет.
            // Тесты исключены этим же блоком: рукописный двойник базы — принятый здесь
            // приём, и запрет пришлось бы обходить в каждом из них.
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'TSAsExpression > TSAsExpression[typeAnnotation.type="TSUnknownKeyword"]',
                    message:
                        'Приведение через `as unknown as` отключает проверку типа: объяви честный тип, прочитай поле через `Reflect.get` или сузь его проверкой. Место, где иначе нельзя, помечается точечным отключением с причиной.',
                },
            ],
        },
    },
    {
        files: ['**/*.ts'],
        plugins: {
            '@nx': nx,
        },
        rules: {
            '@nx/workspace-require-interface-prefix': 'error',
            '@nx/workspace-require-type-prefix': 'error',
            '@nx/workspace-require-enum-prefix': 'error',
            '@nx/workspace-require-suffix-declaration': 'error',
        },
    },
    {
        // SonarJS — все правила на error. Исключения: spec/test (тесты намеренно
        // дублируют код для читаемости), tools/** (нативный node, не application
        // code) и сами конфиги линтеров.
        files: ['**/*.ts', '**/*.js'],
        ignores: [
            '**/*.spec.ts',
            '**/*.test.ts',
            'tools/**',
            'eslint.config.mjs',
            'eslint/**',
            '**/vitest.config.*',
            '**/playwright.config.*',
            '**/jest.config.*',
            '**/.storybook/**',
        ],
        plugins: {
            sonarjs,
        },
        rules: {
            ...sonarjsStrictRules,
            // Default headerFormat="" даёт false-positive для каждого TS-файла
            // с import'ом на первой строке. File-header convention в репо нет.
            'sonarjs/file-header': 'off',
            'sonarjs/declarations-in-global-scope': 'off',
            // nx-монорепо: deps декларируются в корневом package.json, не per-lib;
            // правило не понимает workspace-resolution → ложные срабатывания.
            'sonarjs/no-implicit-dependencies': 'off',
            // Barrel-exports (`export *` в index.ts) — стандартный nx-паттерн.
            'sonarjs/no-wildcard-import': 'off',
        },
    },
    {
        // Node-контексты: приёмник (NestJS), обвязка сборки, конфиги стендов и прогонов,
        // пакет слоя правил (он читает файловую систему и работает из командной строки),
        // обвязка витрин и спеки — все они исполняются узлом, а не страницей.
        // Здесь легитимны process/Buffer/require и консольный лог в точках входа.
        files: [
            'apps/message-bus/**/*.{ts,js}',
            'libs/message-bus-api/**/*.ts',
            'tools/**/*.{ts,js,mjs,cjs}',
            'projects/agent-kit/**/*.ts',
            '**/webpack.config.js',
            '**/playwright.config.ts',
            '**/.storybook/**/*.{ts,js,mjs,cjs}',
            '**/*.spec.ts',
            '**/*.test.ts',
            'stylelint.config.js',
            'prisma.config.ts',
            'prisma/**/*.ts',
        ],
        languageOptions: {
            globals: {
                process: 'readonly',
                Buffer: 'readonly',
                require: 'readonly',
                module: 'writable',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                // Неймспейс типов node: `NodeJS.ProcessEnv`, `NodeJS.WriteStream`
                NodeJS: 'readonly',
            },
        },
        rules: {
            'sonarjs/no-reference-error': 'off',
            // У NestJS зависимости приходят параметрами конструктора — это его
            // штатный способ, а не пережиток. Правило пришло из пресета Angular,
            // где `inject()` действительно уместнее, и совпало по имени
            // декоратора: `@Injectable` есть и там, и там.
            '@angular-eslint/prefer-inject': 'off',
        },
    },
    {
        files: ['apps/message-bus/src/main.ts', 'tools/**/*.{mjs,ts,js}'],
        rules: {
            'no-console': 'off',
        },
    },
    {
        // Обвязка снимков витрины: утверждения приходят глобалями прогонщика, а не импортом.
        files: ['**/.storybook/**/*.{ts,js,mjs,cjs}'],
        languageOptions: {
            globals: {
                expect: 'readonly',
                jest: 'readonly',
            },
        },
    },
    {
        // Окружение браузера приходит внедрением, а не берётся с глобального объекта: когда
        // страницу отдаёт сервер, глобального объекта нет, и прямое обращение падает уже у
        // гостя. Правило `platform-access` называет места, где прямой доступ осознан, — они и
        // стоят в исключениях: точка входа приложения работает раньше, чем появляется
        // внедрение зависимостей, а код сквозных тестов исполняется на самой странице.
        files: ['libs/message-bus-admin/**/*.ts', 'apps/message-bus-admin/src/**/*.ts'],
        ignores: ['**/*.spec.ts', '**/*.test.ts', 'apps/message-bus-admin/src/main.ts'],
        rules: {
            'no-restricted-globals': [
                'error',
                ...[
                    'window',
                    'globalThis',
                    'document',
                    'location',
                    'navigator',
                    'history',
                    'localStorage',
                    'sessionStorage',
                    'screen',
                    'matchMedia',
                    'getComputedStyle',
                    'requestAnimationFrame',
                    'cancelAnimationFrame',
                    'ResizeObserver',
                    'IntersectionObserver',
                    'MutationObserver',
                ].map((name) => ({
                    name,
                    message: `\`${name}\` берётся внедрением: окно — \`inject(WINDOW)\`, документ — \`inject(DOCUMENT)\`, среда — \`inject(PlatformService)\`. Прямое обращение падает там, где страницу отдаёт сервер. Правило — \`platform-access\`.`,
                })),
            ],
        },
    },
    {
        files: ['tools/eslint-rules/**/*.ts', 'tools/stylelint-rules/**/*.{js,cjs}'],
        languageOptions: {
            globals: {
                module: 'readonly',
                require: 'readonly',
                __filename: 'readonly',
                __dirname: 'readonly',
            },
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: ['**/*.spec.ts', '**/*.test.ts', '**/*.spec.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                vi: 'readonly',
                vitest: 'readonly',
                jest: 'readonly',
            },
        },
        rules: {
            // Параметр стрелки в спеке аннотации не требует. Спека сплошь состоит из коротких
            // стрелок — колбэк ожидания, двойник службы, обработчик выхода, — и тип у каждого
            // параметра выводится из места вызова.
            '@typescript-eslint/typedef': [
                'error',
                {
                    parameter: true,
                    arrowParameter: false,
                    propertyDeclaration: true,
                    variableDeclaration: true,
                    memberVariableDeclaration: true,
                    objectDestructuring: false,
                    arrayDestructuring: true,
                },
            ],
        },
    },
    {
        // Playwright: сквозной набор админки.
        ...playwright.configs['flat/recommended'],
        files: ['apps/message-bus-admin-e2e/**/*.ts'],
        rules: {
            ...playwright.configs['flat/recommended'].rules,
            // Выключатель спеки здесь штатный приём, а не забытый долг: спека,
            // необратимо меняющая данные стенда, и спека, которой нужен nginx
            // перед приложением, просыпаются условием — правило `testing`.
            'playwright/no-skipped-test': 'off',
        },
    },
    baseTemplateConfig,
    {
        files: ['**/*.html'],
        // Разметка витрины не является шаблоном Angular: `preview-head.html` — фрагмент головы
        // страницы, и разбор шаблонов на нём отказывает на первом же объявлении типа документа.
        ignores: ['**/apps/*/src/index.html', '**/.storybook/*.html'],
        plugins: {
            '@angular-eslint/template': ngTemplate,
            '@nx': nx,
        },
        languageOptions: {
            parser: ngParser,
        },
        rules: {
            // Форматом шаблонов ведает сам форматтер — `npm run prettier`. Через линтер он
            // разбирает шаблон не своим парсером: `<router-outlet />` читается как выражение
            // кода, и правило требует дописать в разметку точку с запятой.
            'prettier/prettier': 'off',
            '@nx/workspace-require-bem-directives': ['error'],
            '@nx/workspace-no-method-call-in-template': ['error'],
            '@angular-eslint/template/cyclomatic-complexity': ['error', { maxComplexity: 25 }],
            '@angular-eslint/template/no-negated-async': 'error',
        },
    },
    {
        // Шапка страницы держит в одном шаблоне две навигации — широкую и
        // мобильную, — и ветвлений там вдвое больше порога. Разнести их по
        // компонентам — отдельное решение о разбиении публичного компонента,
        // а не правка стиля; до него порог здесь снят точечно.
        files: ['projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.html'],
        rules: {
            '@angular-eslint/template/cyclomatic-complexity': 'off',
        },
    },
    {
        // Демонстрационная разметка витрины блоков BEM не несёт и никуда не шипится: гнать её
        // через rtBlock/rtElem — театр. Гасится только правило BEM; правила доступности здесь
        // остаются в силе — кнопка без доступного имени остаётся дефектом и в демонстрации.
        files: ['**/stories/**/*.{ts,html}', '**/strories/**/*.{ts,html}', '**/showcase/**/*.{ts,html}'],
        plugins: {
            '@nx': nx,
        },
        rules: {
            '@nx/workspace-require-bem-directives': 'off',
            '@nx/workspace-require-host-bem-block': 'off',
            // Обёртка истории — не компонент кита: она никуда не шипится, и её имя `test-*`
            // говорит читателю витрины больше, чем приставка кита.
            '@angular-eslint/component-selector': 'off',
        },
    },
    {
        // Пакет не реэкспортирует символы соседнего пакета. Реэкспорт прячет, какому пакету
        // символ на самом деле принадлежит, и утаскивает весь исходный пакет в граф импортов
        // всякого, кто тронул барель, — так `@rt-tools/utils` снова начал бы зависеть от
        // Angular. У каждого символа ровно один пакет, из которого его импортируют.
        files: ['projects/**/*.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'ExportNamedDeclaration[source.value=/^@rt-tools\\//]',
                    message: 'Не реэкспортируй символ соседнего пакета @rt-tools. Импортируй его из того пакета, которому он принадлежит.',
                },
                {
                    selector: 'ExportAllDeclaration[source.value=/^@rt-tools\\//]',
                    message: 'Не реэкспортируй символ соседнего пакета @rt-tools. Импортируй его из того пакета, которому он принадлежит.',
                },
            ],
        },
    },
    {
        // `@rt-tools/utils` уезжает потребителям на Node наравне с приложениями Angular: ни
        // фреймворка, ни частичной компиляции, ни одноранговых зависимостей. Один импорт вернул
        // бы всё это назад, и пакет молча перестал бы разрешаться вне Angular — поэтому запрет
        // стоит там, где импорт пишут, а не всплывает при публикации.
        files: ['projects/utils/**/*.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@angular/*', '@angular/**', 'rxjs', 'rxjs/*'],
                            message:
                                '@rt-tools/utils остаётся без фреймворка — ни Angular, ни RxJS у него в зависимостях нет. Код, которому фреймворк нужен, живёт в @rt-tools/core.',
                        },
                    ],
                },
            ],
        },
    },
    {
        // Второй кит рисует себя сам: `@angular/cdk` и свои свойства оформления, без Material. Из
        // первого кита в него переезжают восемь семейств, и Material стоит в шестидесяти его
        // файлах — приедет он вместе с первым же перенесённым семейством, молча, одной строкой
        // импорта. Увидят это при публикации: пакет потянет за собой зависимость, о которой не
        // договаривался, и потребитель без Material перестанет его разрешать.
        //
        // Поэтому запрет стоит там, где импорт пишут. Список принятых исключений не заводится
        // намеренно: материала в ките ноль, а пустой список подсказывал бы, что исключения бывают.
        files: ['projects/ui-kit-v2/**/*.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@angular/material', '@angular/material/*', '@angular/material/**'],
                            message:
                                '@rt-tools/ui-kit-v2 обходится без Material: он рисует себя своими свойствами оформления поверх @angular/cdk. Готовое из Material переносится в кит своим семейством, а не зовётся отсюда.',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['**/bem/*.directive.ts'],
        rules: {
            '@angular-eslint/prefer-inject': 'off',
        },
    },
    // Серверная сторона, когда линт зовут от корня дерева: `lint-staged` перед коммитом идёт
    // именно так, и путь здесь совпадает. Тот же список стоит в `eslint/backend.config.mjs` —
    // его подключают конфиги самих проектов, потому что цель линта проекта зовётся из его
    // каталога, и путь от корня там не совпадает ни с одним файлом.
    ...backendConfig.map((entry) => ({
        ...entry,
        files: ['apps/message-bus/**/*.ts', 'libs/message-bus-api/**/*.ts', 'libs/message-bus-common/**/*.ts'],
    })),
    {
        // Предел длины файла — 500 строк, и считаются все строки: пустые и
        // комментарии тоже. Файл, который не влезает на экран целиком, читают по
        // частям, и правку в нём делают, не увидев остального.
        //
        // Правило ядра, а не `sonarjs/max-lines`: то считает только строки кода,
        // и два файла одной длины на экране судились бы по-разному. Одно
        // требование — одно правило, поэтому второе здесь выключено, иначе один
        // и тот же файл приходил бы двумя замечаниями.
        //
        // Спеки судятся наравне с остальным: `*.spec.ts` выведены из блока
        // sonarjs, но длинный тест читается так же плохо, как длинный класс.
        files: ['**/*.ts'],
        rules: {
            'max-lines': ['error', { max: 500, skipBlankLines: false, skipComments: false }],
            'sonarjs/max-lines': 'off',
        },
    },
    {
        // Собранный файл из-под предела длины выведен: довод предела в том, что длинный файл
        // правят по частям, не увидев остального, — а этот не правят вовсе. Его пишет
        // генератор из источника свойств оформления, и длина у него равна числу токенов;
        // поделить его значило бы поделить сам слой оформления. Сверку с источником держит
        // `npm run check:tokens-build`, а не длина.
        //
        // Пока файл не попадал в индекс, линтер его не судил, и предел он перерос молча:
        // на 790 строках отказ пришёл от первой же правки, добавившей две ступени.
        files: ['projects/ui-kit-v2/src/lib/tokens/rt-design-tokens.ts'],
        rules: {
            'max-lines': 'off',
        },
    },
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/tmp/**',
            '**/out-tsc/**',
            '**/coverage/**',
            '**/.angular/**',
            '**/test-setup.ts',
            '**/jest.config.js',
            '**/jest.config.ts',
            '**/jest.preset.js',
            '**/jest.setup.js',
            '**/vitest.config.*.timestamp*',
            '**/apps/*/src/index.html',
            // Сценарий конвейера — не модуль: он исполняется телом, с возвратом на верхнем
            // уровне, и разбирать его как модуль нечем.
            '.claude/workflows/**',
            'projects/agent-kit/assets/workflows/**',
        ],
    },
    {
        // Оснастка спек — двойники, стенды и вспомогательные хелперы, вынесенные из спеки,
        // когда та переросла предел длины. Судится она как спека, а не как боевой код: файл
        // никуда не поставляется — он выведен из сборки библиотеки и живёт только в прогоне
        // тестов. Отдельным именем, а не `*.spec.ts`, потому что своих тестов в нём нет, а
        // прогонщик собирает по этому имени и падает на файле без единого теста.
        files: ['**/*.harness.ts'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly',
            },
        },
        rules: {
            // Стенд поднимает изучаемый компонент, а своего вида не имеет: блока оформления
            // у него нет и быть не должно.
            '@nx/workspace-require-host-bem-block': 'off',
            // Прогон тестов зовёт то, что зовёт, — включая устаревшее: замена ему приходит
            // вместе с версией платформы, а не правкой оснастки.
            'sonarjs/deprecation': 'off',
        },
    },
];

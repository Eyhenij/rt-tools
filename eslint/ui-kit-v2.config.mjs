import { allBoundaries } from './boundaries/index.mjs';

const neighbourReexportMessage =
    'Не реэкспортируй символ соседнего пакета @rt-tools. Импортируй его из того пакета, которому он принадлежит.';

// Блоки второго кита. Корневой конфиг подключает их после общего запрета реэкспорта: в плоском
// конфиге правило берётся из последнего подошедшего блока, и исключение для корня кита должно
// стоять ниже запрета, который оно уточняет.
export const uiKitV2Config = [
    {
        // Второй кит собран точками входа: ядро, по одной на компонент и `rich-editor`. Вход берёт
        // соседний по имени пакета: сборщик пакета собирает входы порознь, и относительный путь в
        // чужой вход он отвергает. Файлы входов лежат не над исходниками, поэтому правило само
        // входы не узнаёт — исключение названо здесь.
        files: ['projects/ui-kit-v2/src/**/*.ts'],
        ignores: ['**/*.spec.ts', '**/stories/**', 'projects/ui-kit-v2/src/showcase/**', 'projects/ui-kit-v2/src/testing/**'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: [
                        '@rt-tools/ui-kit-v2',
                        '@rt-tools/ui-kit-v2/*',
                        '@rt-tools/agent-kit/cargo',
                        '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
                    ],
                    depConstraints: allBoundaries,
                },
            ],
        },
    },
    {
        // Корень второго кита переотдаёт свои же точки входа: так приложение берёт компонент из
        // корня, а сборщик кладёт в кусок только модуль этого компонента. Соседний пакет
        // реэкспортировать по-прежнему нельзя.
        files: ['projects/ui-kit-v2/src/public-api.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'ExportNamedDeclaration[source.value=/^@rt-tools\\//]:not([source.value=/^@rt-tools\\/ui-kit-v2\\//])',
                    message: neighbourReexportMessage,
                },
                {
                    selector: 'ExportAllDeclaration[source.value=/^@rt-tools\\//]:not([source.value=/^@rt-tools\\/ui-kit-v2\\//])',
                    message: neighbourReexportMessage,
                },
            ],
        },
    },
    {
        // Второй кит рисует себя сам: `@angular/cdk` и свои свойства оформления, без Material. Из
        // первого кита в него переезжают восемь семейств, и Material стоит в шестидесяти его
        // файлах — приедет он с первым же перенесённым семейством одной строкой импорта, и пакет
        // потянет зависимость, о которой не договаривался. Поэтому запрет стоит там, где импорт
        // пишут. Список исключений не заводится: пустой подсказывал бы, что исключения бывают.
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
];

import remarkGfm from 'remark-gfm';

import type { StorybookConfig } from '@storybook/angular';

/* eslint-disable */

// Прогон снимков грузит эту настройку в Node, чтобы найти файлы историй, — а
// `storybook-addon-pseudo-states` в Node не грузится вовсе: на верхнем уровне он трогает
// `Element`, и импорт падает с `Element is not defined`. Ошибку прогон проглатывает, но
// окружение остаётся без страницы, и все 124 файла историй падают на
// `Cannot read properties of undefined (reading 'goto')` — выглядит это как сломанная обвязка
// снимков, хотя сломан импорт настройки.
//
// Аддон нужен витрине, а не прогону: состояния рисуются в браузере, на уже поднятой витрине,
// а прогон только ходит к ней по адресу. Поэтому в заходе снимков аддон не подключается.
// Переменную ставит `tools/visual-snapshots-v2.mjs`; поднимать витрину с ней нельзя — тогда
// hover, focus и active пропадут из кадра и эталон закрепит не то состояние.
const isSnapshotRun: boolean = process.env['RT_SNAPSHOT_RUN'] === '1';

const config: StorybookConfig = {
    // `../src/**/*.mdx` — страница-обзор компонента лежит рядом с ним, как лежит его
    // CONTEXT.md: документ, уехавший от того, что описывает, расходится с ним молча.
    // Foundation-страницы остаются в ../docs — они не про конкретный компонент.
    // `../rich-editor/src` — второй вход пакета, компоненты на quill; их страницы стоят в той же витрине.
    stories: [
        '../docs/**/*.mdx',
        '../src/**/*.mdx',
        '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
        '../rich-editor/src/**/*.mdx',
        '../rich-editor/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    ],
    addons: [
        // Без него hover/focus-visible/active не увидеть глазами: они стилизованы в 27 SCSS
        // кита, а мышь в статичной сетке не наведёшь. Аддон переписывает CSS на лету —
        // отгружаемые стили ради витрины трогать не приходится.
        ...(isSnapshotRun ? [] : ['storybook-addon-pseudo-states']),
        {
            name: '@storybook/addon-docs',
            options: {
                mdxPluginOptions: {
                    mdxCompileOptions: {
                        // Без него таблицы в MDX остаются сырым текстом: базовый remark
                        // GitHub-разметку таблиц не разбирает, а документация токенов
                        // на таблицах и стоит.
                        remarkPlugins: [remarkGfm],
                    },
                },
            },
        },
    ],
    framework: {
        name: '@storybook/angular',
        options: {},
    },
    // rt-icon забирает набор по HTTP с `/icons/<имя>.svg` и склеивает в inline-sprite.
    // Отдаём каталог пакета той же статикой, что публикует у себя приложение.
    staticDirs: [
        { from: '../src/assets/icons', to: '/icons' },
        // Второй набор значков отдаётся рядом с первым: без него материальная половина показа
        // молча рисует свои значки, и пара наборов выглядит совпадающей.
        { from: '../src/assets/icons-material', to: '/icons-material' },
    ],
    webpackFinal: async (config) => {
        const definePlugin = config.plugins?.find((plugin) => plugin?.constructor?.name === 'DefinePlugin');
        if (definePlugin && (definePlugin as any).definitions) {
            delete (definePlugin as any).definitions['process.env.NODE_ENV'];
        }
        // Соседние пакеты пишут расширение `.js` на относительных импортах, чтобы их
        // ESM-сборку грузил Node. Витрина собирается из исходников, где рядом лежит `.ts`,
        // и без этой пары webpack ищет несуществующий файл.
        config.resolve = config.resolve ?? {};
        config.resolve.extensionAlias = { ...config.resolve.extensionAlias, '.js': ['.ts', '.js'] };
        return config;
    },
};
export default config;

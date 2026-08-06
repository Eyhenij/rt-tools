import remarkGfm from 'remark-gfm';

import type { StorybookConfig } from '@storybook/angular';

/* eslint-disable */
const config: StorybookConfig = {
    // `../src/**/*.mdx` — страница-обзор компонента лежит рядом с ним, как лежит его
    // CONTEXT.md: документ, уехавший от того, что описывает, расходится с ним молча.
    // Foundation-страницы остаются в ../docs — они не про конкретный компонент.
    stories: ['../docs/**/*.mdx', '../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [
        // Без него hover/focus-visible/active не увидеть глазами: они стилизованы в 27 SCSS
        // кита, а мышь в статичной сетке не наведёшь. Аддон переписывает CSS на лету —
        // отгружаемые стили ради витрины трогать не приходится.
        'storybook-addon-pseudo-states',
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
    staticDirs: [{ from: '../src/assets/icons', to: '/icons' }],
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

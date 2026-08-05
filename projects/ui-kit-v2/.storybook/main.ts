import remarkGfm from 'remark-gfm';

import type { StorybookConfig } from '@storybook/angular';

/* eslint-disable */
const config: StorybookConfig = {
    stories: ['../docs/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [
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

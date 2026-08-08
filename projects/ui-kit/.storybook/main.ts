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
    webpackFinal: async (config) => {
        const definePlugin = config.plugins?.find((plugin) => plugin?.constructor?.name === 'DefinePlugin');
        if (definePlugin && (definePlugin as any).definitions) {
            delete (definePlugin as any).definitions['process.env.NODE_ENV'];
        }
        // Барели @rt-tools/utils зовут соседей с расширением `.js`, как того требует ESM, а лежат
        // файлы `.ts`. Сборщик библиотеки такое разрешает сам, сборщик витрины — нет, и без этой
        // строки витрина не поднимается вовсе: «Can't resolve './lib/const/index.js'».
        config.resolve = config.resolve ?? {};
        (config.resolve as any).extensionAlias = {
            ...((config.resolve as any).extensionAlias ?? {}),
            '.js': ['.ts', '.js'],
        };
        return config;
    },
};
export default config;

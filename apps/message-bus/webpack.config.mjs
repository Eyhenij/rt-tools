import { NxAppWebpackPlugin } from '@nx/webpack/app-plugin';
import { existsSync } from 'fs';
import { join } from 'path';

import { storageClientFailure } from './src/build/storage-client.check.mjs';

/** Корень дерева: конфиг лежит на два каталога глубже. */
const ROOT = join(import.meta.dirname, '../..');

/**
 * Клиент хранилища спрашивается до компиляции. Позже к одной верной строке добавляется сотня
 * ошибок типов, и первой читается не она.
 */
const failure = storageClientFailure((path) => existsSync(join(ROOT, path)));

if (failure) {
    process.stderr.write(`${failure}\n`);
    process.exit(1);
}

export default {
    output: {
        path: join(import.meta.dirname, '../../dist/apps/message-bus'),
        clean: true,
        ...(process.env.NODE_ENV !== 'production' && {
            devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        }),
    },
    plugins: [
        new NxAppWebpackPlugin({
            target: 'node',
            compiler: 'tsc',
            main: './src/main.ts',
            tsConfig: './tsconfig.app.json',
            assets: ['./src/assets'],
            optimization: false,
            outputHashing: 'none',
            generatePackageJson: true,
            sourceMap: true,
        }),
    ],
};

import { NxAppWebpackPlugin } from '@nx/webpack/app-plugin';
import { join } from 'path';

export default {
    output: {
        path: join(import.meta.dirname, '../../dist/apps/auth-example-api'),
        clean: true,
        ...(process.env.NODE_ENV !== 'production' && {
            devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        }),
    },
    resolve: {
        // The packages of the module import their own files with `.js`, as an ESM package does
        extensionAlias: { '.js': ['.ts', '.js'] },
    },
    plugins: [
        new NxAppWebpackPlugin({
            target: 'node',
            compiler: 'tsc',
            main: './src/main.ts',
            tsConfig: './tsconfig.app.json',
            optimization: false,
            outputHashing: 'none',
            generatePackageJson: true,
            sourceMap: true,
        }),
    ],
};

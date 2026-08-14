import { NxAppWebpackPlugin } from '@nx/webpack/app-plugin';
import { join } from 'path';

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

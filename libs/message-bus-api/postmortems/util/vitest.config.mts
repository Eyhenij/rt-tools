import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
    root: __dirname,
    cacheDir: '../../../../node_modules/.vite/libs/message-bus-api/postmortems/util',
    plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
    test: {
        name: 'message-bus-api-postmortems-util',
        watch: false,
        globals: true,
        environment: 'node',
        // Слой, кода в котором ещё нет, спек не имеет — и это не отказ прогона. Пустота
        // при этом видна числом тестов в отчёте, а не цветом прогона.
        passWithNoTests: true,
        include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        reporters: ['default'],
        coverage: {
            reportsDirectory: '../../../../coverage/libs/message-bus-api/postmortems/util',
            provider: 'v8' as const,
        },
    },
}));

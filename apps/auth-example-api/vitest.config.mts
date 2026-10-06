import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
    root: import.meta.dirname,
    cacheDir: '../../node_modules/.vite/apps/auth-example-api',
    plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
    test: {
        name: 'auth-example-api',
        watch: false,
        globals: true,
        environment: 'node',
        passWithNoTests: true,
        include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
        reporters: ['default'],
        coverage: {
            reportsDirectory: '../../coverage/apps/auth-example-api',
            provider: 'v8' as const,
        },
    },
}));

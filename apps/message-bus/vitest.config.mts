import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
    root: import.meta.dirname,
    cacheDir: '../../node_modules/.vite/apps/message-bus',
    plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
    test: {
        name: 'message-bus',
        watch: false,
        globals: true,
        environment: 'node',
        passWithNoTests: true,
        include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
        reporters: ['default'],
        coverage: {
            reportsDirectory: '../../coverage/apps/message-bus',
            provider: 'v8' as const,
        },
    },
}));

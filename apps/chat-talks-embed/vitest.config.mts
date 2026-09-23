import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
    root: __dirname,
    cacheDir: '../../node_modules/.vitest/apps/chat-talks-embed',
    plugins: [nxViteTsPaths()],
    test: {
        name: 'chat-talks-embed',
        watch: false,
        globals: true,
        environment: 'node',
        include: ['src/**/*.{test,spec}.ts'],
        reporters: ['default'],
        coverage: {
            reportsDirectory: '../../coverage/apps/chat-talks-embed',
            provider: 'v8' as const,
        },
    },
}));

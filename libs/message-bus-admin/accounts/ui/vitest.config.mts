/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
    root: __dirname,
    cacheDir: '../../../../node_modules/.vite/libs/message-bus-admin/accounts/ui',
    plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
    // Uncomment this if you are using workers.
    // worker: {
    //   plugins: () => [ nxViteTsPaths() ],
    // },
    test: {
        name: 'message-bus-admin-accounts-ui',
        watch: false,
        // Голый генератор этого не ставит, и либа без единой спеки роняет общий прогон строкой
        // «No test files found» — то есть красным отвечает отсутствие спек, а не их падение.
        passWithNoTests: true,
        globals: true,
        environment: 'jsdom',
        include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        setupFiles: ['src/test-setup.ts'],
        reporters: ['default'],
        coverage: {
            reportsDirectory: '../../../../coverage/libs/message-bus-admin/accounts/ui',
            provider: 'v8' as const,
        },
    },
}));

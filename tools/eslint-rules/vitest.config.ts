import { defineConfig } from 'vitest/config';

export default defineConfig({
    root: __dirname,
    test: {
        watch: false,
        globals: true,
        environment: 'node',
        include: ['rules/**/*.spec.ts'],
        passWithNoTests: true,
        reporters: ['default'],
    },
});

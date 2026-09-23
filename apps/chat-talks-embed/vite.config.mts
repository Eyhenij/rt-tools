import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

/**
 * Сборка скрипта установки: один файл, который админка потребителя подключает тегом.
 *
 * Вид сборки — самовызывающийся: страница потребителя о модулях ничего не обещает. Имя файла без
 * отпечатка: адрес скрипта стоит в чужой странице, и меняться он не должен от каждой выкатки.
 */
export default defineConfig(() => ({
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/chat-talks-embed',
    plugins: [nxViteTsPaths()],
    build: {
        outDir: '../../dist/apps/chat-talks-embed',
        emptyOutDir: true,
        lib: {
            entry: 'src/main.ts',
            name: 'RtChatTalks',
            formats: ['iife' as const],
            fileName: (): string => 'talks.js',
        },
    },
}));

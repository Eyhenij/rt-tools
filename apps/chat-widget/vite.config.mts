import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

/**
 * Сборка виджета: один файл, который страница потребителя подключает скриптом.
 *
 * Вид сборки — самовызывающийся: страница потребителя о модулях ничего не обещает, а скрипт
 * модулем не грузится в старом браузере вовсе. Имя файла без отпечатка: адрес скрипта стоит в
 * чужой странице, и меняться он не должен от каждой выкатки.
 */
export default defineConfig(() => ({
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/chat-widget',
    plugins: [nxViteTsPaths()],
    build: {
        outDir: '../../dist/apps/chat-widget',
        emptyOutDir: true,
        lib: {
            entry: 'src/main.ts',
            name: 'RtChatWidget',
            formats: ['iife' as const],
            fileName: (): string => 'widget.js',
        },
    },
}));

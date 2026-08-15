import { defineConfig, devices } from '@playwright/test';

import { ADMIN_ORIGIN } from './stand/stand.mjs';

/**
 * Сквозной набор админки.
 *
 * Стенд поднимается одной командой и целиком: прод-сборки приёмника и админки, база стенда, её
 * схема и засев. Прогонщик ждёт адреса админки — к этой минуте всё остальное уже стоит.
 *
 * Браузер один — chromium: на машине владельца поставлен только он, и прогон в остальных падает
 * состоянием машины, а не дефектом правки. Узкий экран проверяется тем же браузером в размере
 * телефона: карточка вместо строки — обещание раскладки, а не отдельного браузера.
 *
 * Повторов у упавшего теста нет намеренно. Стенд свой, данные засеяны заново, и упавший тест
 * здесь означает расхождение с обещанием, а не занятую машину; повтор прятал бы ровно то, ради
 * чего набор и заведён.
 *
 * Пояс и язык браузера названы явно: время показывается в поясе того, кто смотрит, и набор,
 * взявший пояс у машины, проверял бы настройку машины, а не экран.
 */
export default defineConfig({
    testDir: './src',
    fullyParallel: false,
    forbidOnly: Boolean(process.env['CI']),
    retries: 0,
    workers: 1,
    reporter: [['list']],
    timeout: 60_000,
    expect: { timeout: 10_000 },
    use: {
        baseURL: ADMIN_ORIGIN,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        locale: 'ru-RU',
        timezoneId: 'Europe/Minsk',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
            testIgnore: ['**/*.narrow.spec.ts'],
        },
        {
            name: 'narrow',
            use: { ...devices['Pixel 7'] },
            testMatch: ['**/*.narrow.spec.ts'],
        },
    ],
    webServer: {
        command: 'node apps/message-bus-admin-e2e/stand/up.mjs',
        url: ADMIN_ORIGIN,
        cwd: '../..',
        reuseExistingServer: !process.env['CI'],
        timeout: 300_000,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});

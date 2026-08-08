import type { TestRunnerConfig } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

/**
 * Визуальная проверка витрины: каждая история снимается и сверяется с эталоном.
 *
 * Замер вычисленных значений отвечает только на заданный вопрос — снимок ловит всё
 * видимое разом. Эталоны лежат рядом, в `__snapshots__`, и сняты на той же машине,
 * на которой гоняется CI: собственный раннер снимает эту разницу платформ целиком.
 */

/** Снимки лежат при витрине, а не в корне: их читают вместе с историями. */
const SNAPSHOT_DIR: string = `${process.cwd()}/projects/ui-kit/.storybook/__snapshots__`;

/**
 * Порог расхождения. Ноль здесь не ставится: сглаживание шрифта даёт единицы пикселей
 * разницы между запусками даже на неизменном дереве, и прогон начинает мигать.
 */
const FAILURE_THRESHOLD: number = 0.002;

/** Сколько ждать шрифт значков: он приходит из сети, а до него иконка себя прячет. */
const FONT_TIMEOUT_MS: number = 10_000;

/** Пауза после глушения движения — кадру нужно успеть встать. */
const SETTLE_MS: number = 150;

const config: TestRunnerConfig = {
    setup(): void {
        expect.extend({ toMatchImageSnapshot });
    },

    async postVisit(page, context): Promise<void> {
        // Шрифт значков грузится с внешнего адреса, а `rtui-icon` до его загрузки держит
        // себя невидимой. Снимок, сделанный раньше, отличается от эталона всегда.
        await page.evaluate(() => document.fonts.ready);
        await page
            .waitForFunction(() => document.querySelector('.rtui-icon--loading') === null, undefined, { timeout: FONT_TIMEOUT_MS })
            .catch(() => undefined);

        // Рябь Material и анимации панелей дают недетерминированный кадр: движение
        // останавливается, а не пережидается — пережидать пришлось бы каждый раз дольше.
        await page.addStyleTag({
            content: `
                *,
                *::before,
                *::after {
                    animation-duration: 0s !important;
                    animation-delay: 0s !important;
                    transition-duration: 0s !important;
                    transition-delay: 0s !important;
                    caret-color: transparent !important;
                }
            `,
        });
        // Анимации каркаса идут не через CSS, а через программный интерфейс анимаций, и
        // объявлением нулевой длительности не останавливаются вовсе: панель действий
        // приезжала снизу и попадала в кадр на середине пути. Здесь они доводятся до конца.
        await page.evaluate(() => {
            document.getAnimations().forEach((animation: Animation) => animation.finish());
        });
        await page.waitForTimeout(SETTLE_MS);

        const image: Buffer = await page.screenshot({ fullPage: true });

        expect(image).toMatchImageSnapshot({
            customSnapshotsDir: SNAPSHOT_DIR,
            customSnapshotIdentifier: context.id,
            failureThreshold: FAILURE_THRESHOLD,
            failureThresholdType: 'percent',
        });
    },
};

export default config;

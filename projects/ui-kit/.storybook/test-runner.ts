import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
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

/** Размер кадра по умолчанию. Истории, которым нужен другой, называют его параметром. */
const VIEWPORT: { width: number; height: number } = { width: 1280, height: 720 };

const config: TestRunnerConfig = {
    setup(): void {
        expect.extend({ toMatchImageSnapshot });
    },

    async preVisit(page, context): Promise<void> {
        // Содержимое в перекрытии живёт вне потока страницы, и полный снимок его не
        // достраивает: попап или панель выше кадра просто обрезаются. Кадр под такую
        // историю задаётся ею самой — параметром `snapshotViewport`.
        const story = await getStoryContext(page, context);
        const requested = story.parameters?.snapshotViewport as { width?: number; height?: number } | undefined;

        await page.setViewportSize({
            width: requested?.width ?? VIEWPORT.width,
            height: requested?.height ?? VIEWPORT.height,
        });
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
        // Состояние под наведением наводится настоящим указателем, а не событием из истории:
        // полный снимок перекладывает страницу заново, и наведение, разыгранное событием,
        // до кадра не доживает.
        const story = await getStoryContext(page, context);
        const hovered = story.parameters?.snapshotHover as string | undefined;

        if (hovered) {
            await page.locator(hovered).first().hover();
        }

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

import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import type { Page } from 'playwright';

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
 * Порог расхождения. Две съёмки одной истории подряд сходятся пиксель в пиксель, поэтому
 * порог держится у нуля: подпись кнопки занимает сотые доли кадра, и порог пощедрее
 * пропускал бы её правку молча.
 */
const FAILURE_THRESHOLD: number = 0.0002;

/** Сколько ждать шрифт значков: он приходит из сети, а до него иконка себя прячет. */
const FONT_TIMEOUT_MS: number = 10_000;

/** Пауза после глушения движения — кадру нужно успеть встать. */
const SETTLE_MS: number = 150;

/**
 * Поздняя граница ожидания вставшей страницы. Не мерило готовности, а предел: страница, которая
 * не встала и за это время, — поломка истории, и снимать её нечего.
 */
const LAYOUT_TIMEOUT_MS: number = 15_000;

/**
 * Сколько кадров подряд размеры страницы должны совпасть, чтобы считать её вставшей. Двух
 * хватает: между ними проходит перерисовка, и растущий блок успевает изменить высоту.
 */
const STILL_FRAMES: number = 2;

/** Размер кадра по умолчанию. Истории, которым нужен другой, называют его параметром. */
const VIEWPORT: { width: number; height: number } = { width: 1280, height: 720 };

/**
 * Ждёт вставшую страницу событием, а не отсчётом времени.
 *
 * Отсчёт проверяет машину, а не вёрстку: на свободной он всегда достаточен, на занятой — нет, и
 * какой именно кадр не успел, оказывается делом случая. Здесь ждутся два признака, и ни один из
 * них от загрузки машины не зависит.
 *
 * Приём повторён из обвязки второго кита, а не вынесен в общий с ней модуль: киты разведены
 * намеренно, и общий файл связал бы их там, где связи нет, — правка ради второго роняла бы
 * эталоны первого. В согласии эти две копии держит правило дерева, а не импорт.
 *
 * Снимок здесь берётся целой страницей, поэтому и размер считается по корневому узлу документа,
 * а не по корню показа: растёт и меняет высоту именно страница.
 */
async function settled(page: Page): Promise<void> {
    // Шрифт значков и картинки историй едут по сети, и до их прихода страница стоит неизменной —
    // то есть выглядит вставшей. Одни только совпавшие размеры принимают такую пустоту за
    // готовый кадр: сравнивать их имеет смысл после того, как сеть замолчала.
    await page.waitForLoadState('networkidle');

    await page.waitForFunction(
        (frames: number) =>
            new Promise<boolean>((resolve) => {
                const size = (): string => {
                    const box: DOMRect = document.documentElement.getBoundingClientRect();
                    return `${Math.round(box.width)}x${Math.round(box.height)}`;
                };

                let previous: string = size();
                let same: number = 0;

                const step = (): void => {
                    const current: string = size();
                    same = current === previous ? same + 1 : 0;
                    previous = current;

                    if (same >= frames) {
                        resolve(true);
                        return;
                    }

                    requestAnimationFrame(step);
                };

                requestAnimationFrame(step);
            }),
        STILL_FRAMES,
        { timeout: LAYOUT_TIMEOUT_MS }
    );
}

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
        } else {
            // Указатель переживает переход к следующей истории и наводится уже на её
            // разметку: снимок соседа приходит с проявившейся кнопкой, которой там не ждут.
            await page.mouse.move(0, 0);
        }

        await page.waitForTimeout(SETTLE_MS);
        await settled(page);

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

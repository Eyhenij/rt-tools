import type { TestContext, TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import type { Page, Route } from 'playwright';

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

/** Семейства значков, которыми рисуются истории. Кадр без любого из них сравнивать не с чем. */
const ICON_FONTS: readonly string[] = ['Material Icons', 'Material Icons Outlined'];

/**
 * Сколько ждать перерисовку значков после того, как шрифт встал. Не мерило готовности, а
 * предел: пришедший шрифт компонент замечает своим сигналом, и от загруженности машины эта
 * перерисовка не зависит вовсе.
 */
const ICON_REPAINT_TIMEOUT_MS: number = 10_000;

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

/** Машины, с которых съёмке разрешено брать что бы то ни было: витрина отдаёт всё сама. */
const LOCAL_HOSTS: ReadonlySet<string> = new Set<string>(['localhost', '127.0.0.1', '[::1]']);

/** Страницы с уже поставленным отсечением: обвязка проходит по одной странице много раз. */
const cutOff: WeakSet<Page> = new WeakSet<Page>();

/**
 * Отсекает съёмку от чужой сети.
 *
 * Всё, из чего складывается кадр, лежит в дереве и отдаётся самой витриной — шрифт значков в
 * том числе. Пока хоть что-то ехало снаружи, кадр зависел от чужой доступности: не приехав,
 * шрифт оставлял значки невидимыми, подписи кнопок вставали на их место, и кадр расходился с
 * эталоном там, где вёрстку никто не трогал. Отсечение держит это не памятью автора:
 * вернувшийся внешний адрес роняет свою историю громко, а не гадает от прогона к прогону.
 */
async function cutOffNetwork(page: Page): Promise<void> {
    if (cutOff.has(page)) {
        return;
    }

    cutOff.add(page);

    await page.route('**/*', async (route: Route): Promise<void> => {
        const address: string = route.request().url();

        if (!address.startsWith('http://') && !address.startsWith('https://')) {
            await route.continue();
            return;
        }

        if (LOCAL_HOSTS.has(new URL(address).hostname)) {
            await route.continue();
            return;
        }

        await route.abort();
    });
}

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
            new Promise<boolean>((resolve: (settled: boolean) => void) => {
                const size: () => string = (): string => {
                    const box: DOMRect = document.documentElement.getBoundingClientRect();
                    return `${Math.round(box.width)}x${Math.round(box.height)}`;
                };

                let previous: string = size();
                let same: number = 0;

                const step: () => void = (): void => {
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

    async preVisit(page: Page, context: TestContext): Promise<void> {
        await cutOffNetwork(page);

        // Содержимое в перекрытии живёт вне потока страницы, и полный снимок его не
        // достраивает: попап или панель выше кадра просто обрезаются. Кадр под такую
        // историю задаётся ею самой — параметром `snapshotViewport`.
        const story: Awaited<ReturnType<typeof getStoryContext>> = await getStoryContext(page, context);
        const requested: { width?: number; height?: number } | undefined = story.parameters?.snapshotViewport as
            { width?: number; height?: number } | undefined;

        await page.setViewportSize({
            width: requested?.width ?? VIEWPORT.width,
            height: requested?.height ?? VIEWPORT.height,
        });
    },

    async postVisit(page: Page, context: TestContext): Promise<void> {
        // Шрифт значков отдаёт сама витрина, но и её ответа надо дождаться: `rtui-icon` до
        // загрузки шрифта держит себя невидимой, и снимок, сделанный раньше, отличается от
        // эталона всегда.
        //
        // Ожидание идёт по самим семействам, а не по классу ожидания у иконки. Класс она
        // снимает по `document.fonts.ready`, а тот разрешается и пустым набором: не приехали
        // сами объявления шрифта — ждать нечего, значки остаются невидимыми, и кадр уходит в
        // сравнение молча. Замером это и поймано: съёмка без объявлений дала 26 разошедшихся
        // снимков и ни одного отказа по шрифту.
        //
        // Отказ не гасится намеренно. Красное «шрифт не встал» стоит одной строки разбора,
        // красное «снимок разошёлся» — целого захода.
        const missing: string[] = await page.evaluate(async (families: readonly string[]): Promise<string[]> => {
            const absent: string[] = [];

            for (const family of families) {
                try {
                    // Браузер грузит семейство лениво — только под тот текст, что им рисуется.
                    // Контурного на большинстве историй нет вовсе, поэтому загрузка вызывается
                    // явно: иначе непришедший шрифт неотличим от невостребованного.
                    const faces: FontFace[] = await document.fonts.load(`1rem "${family}"`);

                    if (faces.length === 0 || !document.fonts.check(`1rem "${family}"`)) {
                        absent.push(family);
                    }
                } catch {
                    absent.push(family);
                }
            }

            return absent;
        }, ICON_FONTS);

        if (missing.length > 0) {
            throw new Error(
                `Шрифт значков не встал: история «${context.id}» осталась со значками-невидимками, и кадр с неё сравнивать ` +
                    `не с чем. Не поднялось: ${missing.join(', ')} — эти семейства лежат в дереве и едут от самой витрины, ` +
                    'значит поломка в её настройке или в шапке показа, а не расхождение вёрстки.'
            );
        }

        // Встать шрифту мало: пока `rtui-icon` не заметил его своим сигналом, она держит себя
        // невидимой, а подписи кнопок стоят на месте значков. Между приходом шрифта и
        // перерисовкой — целая гонка, и кадр в неё попадает: сотня прогонов подряд поймала
        // разошедшийся снимок при поднятом шрифте, тем же числом, каким расходились все
        // встречи до правки. Поэтому ждутся оба — сам шрифт и снятый им класс ожидания.
        try {
            await page.waitForFunction(() => document.querySelector('.rtui-icon--loading') === null, undefined, {
                timeout: ICON_REPAINT_TIMEOUT_MS,
            });
        } catch {
            throw new Error(
                `Значки не перерисовались за ${ICON_REPAINT_TIMEOUT_MS} мс: история «${context.id}» держит класс ожидания, ` +
                    'хотя шрифт поднялся. Кадр с неё сравнивать не с чем — это поломка компонента значка, а не расхождение ' +
                    'вёрстки.'
            );
        }

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
        const story: Awaited<ReturnType<typeof getStoryContext>> = await getStoryContext(page, context);
        const hovered: string | undefined = story.parameters?.snapshotHover as string | undefined;

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

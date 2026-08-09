import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from 'playwright';

/**
 * Визуальная проверка витрины второго кита: каждая история снимается и сверяется с эталоном.
 *
 * Своя обвязка, а не общая с первым китом: киты разведены намеренно — свои селекторы, свои
 * токены, своя витрина, — и общий файл связал бы их там, где связи нет. Правка ради второго
 * роняла бы эталоны первого.
 *
 * Договорённость, которую этот файл исполняет, — `docs/specs/ui-kit-v2/proposed/visual-snapshots/`.
 */

/** Снимки лежат при витрине, а не в корне: их читают вместе с историями. */
const SNAPSHOT_DIR: string = `${process.cwd()}/projects/ui-kit-v2/.storybook/__snapshots__`;

/**
 * Порог расхождения. Кадр берётся по корню показа, а не по всей странице, поэтому доля площади
 * снова означает то же, что у первого кита: сетка занимает почти весь кадр.
 *
 * Число держится у нуля до замера на группе компонентов — `Q-1` договорённости. Порог пощедрее
 * пропускал бы правку одной ячейки молча, а это ровно тот зелёный прогон, который не ловит.
 */
const FAILURE_THRESHOLD: number = 0.0002;

/** Сколько ждать шрифт значков: он приходит из сети, а до него значок себя прячет. */
const FONT_TIMEOUT_MS: number = 10_000;

/** Пауза после глушения движения — кадру нужно успеть встать. */
const SETTLE_MS: number = 150;

/** Размер базового кадра. История, которой нужен другой, называет его сама. */
const VIEWPORT: { width: number; height: number } = { width: 1280, height: 720 };

/** Признак корня показа: его ставят сетка, ряд и сравнение тем из `src/showcase/`. */
const ROOT_SELECTOR: string = '[data-story-root]';

/** Признак хоста, чьё перекрытие открывает `play`-функция истории. */
const TRIGGER_SELECTOR: string = '[data-story-trigger]';

/**
 * Куда обвязка пишет имена снятых кадров. Реестр читает сверка каталога: эталон, которому нет
 * истории, вечно зелен — прогон его просто не открывает, — и каталог перестаёт отвечать на
 * вопрос, что проверено.
 *
 * Путь приходит снаружи, от команды прогона: она же реестр создаёт и она же его читает.
 */
const TAKEN_REGISTRY: string | undefined = process.env.RT_SNAPSHOT_REGISTRY;

/**
 * Идёт ли пересъёмка. Ставится командой пересъёмки, и только в этом заходе эталону позволено
 * появиться на диске.
 */
const UPDATING: boolean = process.env.RT_SNAPSHOT_UPDATE === '1';

/** Параметры съёмки истории — их объявляет `src/showcase/story-snapshot.ts`. */
interface ISnapshotParameters {
    skip?: string;
    widths?: readonly number[];
    fullPage?: boolean;
}

/** Записать снятый кадр в реестр, чтобы сверка каталога знала, что он ожидаем. */
function remember(identifier: string): void {
    if (TAKEN_REGISTRY !== undefined) {
        appendFileSync(TAKEN_REGISTRY, `${identifier}\n`);
    }
}

/**
 * Доводит страницу до состояния, в котором две съёмки подряд совпадают: шрифты пришли, движение
 * остановлено, каркасные анимации доиграны, указатель уведён.
 */
async function quiet(page: Page): Promise<void> {
    // Шрифт значков грузится с внешнего адреса, а значок до его загрузки держит себя невидимым.
    // Снимок, сделанный раньше, отличается от эталона всегда.
    await page.evaluate(() => document.fonts.ready);
    await page
        .waitForFunction(() => document.querySelector('.rt-icon--loading') === null, undefined, { timeout: FONT_TIMEOUT_MS })
        .catch(() => undefined);

    // Движение останавливается, а не пережидается — пережидать пришлось бы каждый раз дольше.
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

    // Анимации каркаса идут не через CSS, а через программный интерфейс анимаций, и объявлением
    // нулевой длительности не останавливаются вовсе: панель попадала бы в кадр на середине пути.
    await page.evaluate(() => {
        document.getAnimations().forEach((animation: Animation) => animation.finish());
    });

    // Указатель переживает переход к следующей истории и наводится уже на её разметку: снимок
    // соседа приходил бы с проявившейся кнопкой, которой там не ждут.
    await page.mouse.move(0, 0);
    await page.waitForTimeout(SETTLE_MS);
}

/**
 * Отказывает, если история открывает перекрытие сама, а оно не открылось.
 *
 * Кадр с закрытым перекрытием неотличим от исправной истории, у которой перекрытия и не должно
 * быть: эталон такого кадра узаконил бы поломку молча и снял бы её с учёта навсегда.
 */
async function requireOpenedOverlay(page: Page, identifier: string): Promise<void> {
    const expectsOverlay: boolean = (await page.locator(TRIGGER_SELECTOR).count()) > 0;
    if (!expectsOverlay) {
        return;
    }

    const opened: number = await page.locator('.cdk-overlay-container .cdk-overlay-pane').count();
    if (opened === 0) {
        throw new Error(
            `${identifier}: история отмечена триггером перекрытия, но к моменту съёмки панель не открылась. Кадр не снимается.`
        );
    }
}

/**
 * Снимает кадр по корню показа и сверяет его с эталоном.
 *
 * Кадр берётся по корню, а не по всей странице: порог считается от площади кадра, и в странице,
 * где сетка занимает малую долю, поехавшая ячейка проходит молча.
 */
async function shoot(page: Page, identifier: string, fullPage: boolean): Promise<void> {
    let image: Buffer;

    if (fullPage) {
        image = await page.screenshot({ fullPage: true });
    } else {
        if ((await page.locator(ROOT_SELECTOR).count()) === 0) {
            throw new Error(
                `${identifier}: показ не рисуется помощниками витрины, и корня ${ROOT_SELECTOR} на странице нет. ` +
                    `Объяви кадр целой страницы параметром snapshot.fullPage либо покажи компонент сеткой из src/showcase.`
            );
        }
        image = await page.locator(ROOT_SELECTOR).first().screenshot();
    }

    remember(identifier);

    // Библиотека сверки при отсутствующем эталоне молча дописывает файл и проходит зелёной: то
    // есть прогон зелен ровно потому, что сверять было не с чем. Эталон появляется только в
    // заходе пересъёмки, и только намеренно.
    if (!UPDATING && !existsSync(join(SNAPSHOT_DIR, `${identifier}.png`))) {
        throw new Error(
            `${identifier}: эталона нет. Сними его намеренно: pnpm run test:visual:v2:update '<образец пути файла историй>' — ` +
                `молча он не появляется, иначе прогон зелен из-за отсутствия сверки.`
        );
    }

    expect(image).toMatchImageSnapshot({
        customSnapshotsDir: SNAPSHOT_DIR,
        customSnapshotIdentifier: identifier,
        failureThreshold: FAILURE_THRESHOLD,
        failureThresholdType: 'percent',
    });
}

const config: TestRunnerConfig = {
    setup(): void {
        expect.extend({ toMatchImageSnapshot });
    },

    async preVisit(page, context): Promise<void> {
        const story = await getStoryContext(page, context);
        const snapshot: ISnapshotParameters = (story.parameters?.snapshot as ISnapshotParameters | undefined) ?? {};

        // Пометка без причины возвращает молчаливый пропуск, ради которого набор и задан
        // вычитанием: отличить «не снимается» от «забыли» нечем.
        if (snapshot.skip !== undefined && snapshot.skip.trim() === '') {
            throw new Error(`${context.id}: история помечена исключением без причины. Назови причину в storySnapshotSkip().`);
        }

        await page.setViewportSize(VIEWPORT);
    },

    async postVisit(page, context): Promise<void> {
        const story = await getStoryContext(page, context);
        const snapshot: ISnapshotParameters = (story.parameters?.snapshot as ISnapshotParameters | undefined) ?? {};

        // Снимается всё, кроме помеченного. Обратный порядок — «снимается помеченное» — дал бы
        // зелёный прогон и ноль проверенных пикселей у матрицы, при которой признак забыли.
        if (snapshot.skip !== undefined) {
            return;
        }

        await quiet(page);
        await requireOpenedOverlay(page, context.id);
        await shoot(page, context.id, snapshot.fullPage === true);

        // Кадр порога — по одному на каждый порог, который называет сам компонент. Один общий
        // дополнительный кадр оставил бы две ветки раскладки непроверенными и показал бы их
        // покрытыми.
        for (const width of snapshot.widths ?? []) {
            await page.setViewportSize({ width, height: VIEWPORT.height });
            await quiet(page);
            await shoot(page, `${context.id}--w${width}`, snapshot.fullPage === true);
        }
    },
};

export default config;

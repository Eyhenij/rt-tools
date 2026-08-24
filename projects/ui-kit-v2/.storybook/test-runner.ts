import type { TestContext, TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from 'playwright';

import { RT_ICON_SPRITE_ID } from '../src/lib/components/icon/rt-icon.const.ts';
import { STORY_SNAPSHOT_VIEWPORT } from '../src/showcase/story-snapshot.ts';

/**
 * Визуальная проверка витрины второго кита: каждая история снимается и сверяется с эталоном.
 *
 * Своя обвязка, а не общая с первым китом: киты разведены намеренно — свои селекторы, свои
 * токены, своя витрина, — и общий файл связал бы их там, где связи нет. Правка ради второго
 * роняла бы эталоны первого.
 *
 * Договорённость, которую этот файл исполняет, — `docs/specs/ui-kit-v2/`.
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

/**
 * Сколько ждать набор значков. Он не шрифт: реестр забирает три сотни файлов по сети и склеивает
 * их в один `<svg id="rt-icon-sprite">` в начале `body`. Пока набора нет, `<use href="#…">`
 * каждого значка не рисует ничего — кадр выходит без значков, и вся раскладка ряда съезжает.
 */
const ICONS_TIMEOUT_MS: number = 30_000;

/**
 * Признак, по которому со страницы видно, что набор значков доехал. Берётся там же, где его
 * объявляет реестр: своя копия ждала бы узла с другим именем, а прогон при этом оставался бы
 * зелёным — кадр просто выходил бы без значков.
 */
const ICON_SPRITE_ID: string = RT_ICON_SPRITE_ID;

/** Пауза после глушения движения — кадру нужно успеть встать. */
const SETTLE_MS: number = 150;

/**
 * Поздняя граница ожидания вставшего показа. Не мерило готовности, а предел: показ, который не
 * встал и за это время, — поломка истории, и снимать его нечего.
 */
const LAYOUT_TIMEOUT_MS: number = 15_000;

/**
 * Сколько кадров подряд размеры показа должны совпасть, чтобы считать его вставшим. Двух хватает:
 * между ними проходит перерисовка, и растущий блок успевает изменить высоту.
 */
const STILL_FRAMES: number = 2;

/**
 * Сколько раз окно подгоняется под страницу, прежде чем обвязка перестаёт пытаться.
 *
 * Раздвинутое окно меняет то, что от него считается, — `100vh`, `100vw`, медиазапросы, — и
 * страница после подгонки способна вырасти снова. Обычно она сходится с первого раза; на
 * последней попытке обвязка снимает то, что вышло. Гнаться без предела за показом, который
 * растёт от каждой подгонки, незачем: размера у такого показа не существует вовсе, и сказать об
 * этом кадром честнее, чем зависнуть в прогоне.
 */
const FIT_ATTEMPTS: number = 3;

/**
 * Размер базового кадра берётся там же, где его объявляет витрина: второе объявление расходилось
 * бы с первым молча — кадр снят одним размером, а история сверстана под другой.
 */
const VIEWPORT: { readonly width: number; readonly height: number } = STORY_SNAPSHOT_VIEWPORT;

/** Признак корня показа: его ставят сетка, ряд и сравнение тем из `src/showcase/`. */
const ROOT_SELECTOR: string = '[data-story-root]';

/** Признак хоста, чьё перекрытие открывает `play`-функция истории. */
const TRIGGER_SELECTOR: string = '[data-story-trigger]';

/**
 * Признак компонента, чья начинка ещё не смонтирована. Ставит его сам компонент кита и снимает,
 * когда достроился: снаружи недостроенный компонент неотличим от достроенного пустого.
 */
const PENDING_SELECTOR: string = '[data-rt-pending]';

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
    overlay?: string;
}

/** Записать снятый кадр в реестр, чтобы сверка каталога знала, что он ожидаем. */
/**
 * Ждёт, пока показ не встанет: размеры его корня должны совпасть в двух перерисовках подряд.
 *
 * Часть компонентов кита приезжает динамическим импортом уже после первой отрисовки — редактор
 * так и устроен, — и до его появления на месте показа стоит пустое место. Отсчёт времени тут не
 * мерило: на свободной машине он проходит, на занятой нет, и кадр выходит втрое ниже эталона.
 * Снимок редактора падал этим стабильно, а читалось это как плавающие кадры.
 *
 * Ждётся именно тот узел, который снимается: страница целиком успокаивается и тогда, когда
 * внутри корня показа ещё пусто.
 */
async function settled(page: Page): Promise<void> {
    if ((await page.locator(ROOT_SELECTOR).count()) === 0) {
        return;
    }

    // Компонент, чья начинка приезжает динамическим импортом, держит на хосте признак
    // недостроенности и снимает его, смонтировавшись. Ждётся именно он: пустое место на месте
    // такого компонента стоит секундами и всё это время не меняет размеров — то есть выглядит
    // вставшим показом. Снимок редактора падал ровно этим, а читалось это как плавающий кадр.
    await page.waitForSelector(PENDING_SELECTOR, { state: 'detached', timeout: LAYOUT_TIMEOUT_MS });

    // Динамический чанк едет по сети, и до его прихода показ стоит пустым — то есть неизменным.
    // Одни только совпавшие размеры принимают такую пустоту за вставший показ: сравнивать их
    // имеет смысл после того, как сеть замолчала.
    await page.waitForLoadState('networkidle');

    await page.waitForFunction(
        ([selector, frames]: [string, number]) =>
            new Promise<boolean>((resolve: (settled: boolean) => void) => {
                const root: Element | null = document.querySelector(selector);
                if (root === null) {
                    resolve(true);
                    return;
                }

                const size: () => string = (): string => {
                    const box: DOMRect = root.getBoundingClientRect();
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
        [ROOT_SELECTOR, STILL_FRAMES] as [string, number],
        { timeout: LAYOUT_TIMEOUT_MS }
    );
}

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
    await page.evaluate(() => document.fonts.ready);

    // Набор значков едет по сети, и до него `<use>` не рисует ничего. Ждётся не наличие набора в
    // разметке, а нарисованный значок: набор витрина пересобирает между историями — снимает
    // прежний и вставляет новый, — и в этот промежуток он на странице есть, а значок пуст.
    //
    // Ожидание не глушится: кадр без значков — это состояние, до которого съёмка не дошла, а не
    // повод снять эталон. Прежняя проверка ждала класс `.rt-icon--loading`, которого у значка нет
    // вовсе: условие выполнялось сразу, и на загруженной машине часть кадров выходила без значков.
    await page.waitForFunction(
        (spriteId: string) => {
            if (document.querySelector('rt-icon') === null) {
                return true;
            }
            if (document.getElementById(spriteId) === null) {
                return false;
            }

            // Значок, которого не видно самого (скрыт, свёрнут, за пределами показа), ничего не
            // говорит о готовности набора: его `<use>` пуст и с пришедшим набором.
            return Array.from(document.querySelectorAll('rt-icon')).every((icon: Element): boolean => {
                const host: DOMRect = icon.getBoundingClientRect();
                if (host.width === 0 || host.height === 0) {
                    return true;
                }
                const use: Element | null = icon.querySelector('use');
                if (use === null) {
                    return false;
                }
                const drawn: DOMRect = use.getBoundingClientRect();
                return drawn.width > 0 && drawn.height > 0;
            });
        },
        ICON_SPRITE_ID,
        { timeout: ICONS_TIMEOUT_MS }
    );

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
    await settled(page);
}

/**
 * Отказывает, если история открывает перекрытие сама, а оно не открылось.
 *
 * Кадр с закрытым перекрытием неотличим от исправной истории, у которой перекрытия и не должно
 * быть: эталон такого кадра узаконил бы поломку молча и снял бы её с учёта навсегда.
 */
async function requireOpenedOverlay(page: Page, identifier: string, overlay: string | undefined): Promise<void> {
    // История назвала узел, который обещает показать: сверяется он, а не число панелей. Панель на
    // странице есть и без перекрытия — её держит шина оповещений, — и счётом открытое от закрытого
    // не отличить нигде, кроме историй, где кроме перекрытия нет ничего.
    if (overlay !== undefined) {
        if ((await page.locator(`${overlay}:visible`).count()) === 0) {
            throw new Error(
                `${identifier}: история обещала показать ${overlay}, а к моменту съёмки его на странице нет. Кадр не снимается.`
            );
        }
        return;
    }

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
 * Глушит уход указателя на странице истории, показывающей раскрытую панель.
 *
 * Панель кита, открытая наведением, закрывается не сразу, а с отсрочкой в сотую долю секунды
 * после ухода указателя. Подготовка кадра до съёмки уводит указатель в угол, и этой отсрочки
 * хватало ровно на то, чтобы панель погасла между открытием и снимком: эталон выходил с закрытой
 * панелью, а прогон при этом был зелёный. Глушится событие целиком, а не одно движение мыши:
 * уход указателя приходит и от перерисовки под ним, и от разметки, приехавшей поверх.
 *
 * Слушатель ставится на перехвате: событие ухода не всплывает, но вниз к своей цели идёт через
 * документ, и остановленное здесь до обработчика кита не доходит.
 */
async function freezeHover(page: Page): Promise<void> {
    await page.evaluate(() => {
        const flag: string = 'rtHoverFrozen';
        const host: Window & Record<string, unknown> = window as unknown as Window & Record<string, unknown>;
        if (host[flag] === true) {
            return;
        }
        host[flag] = true;

        const swallow: (event: Event) => void = (event: Event): void => event.stopPropagation();
        document.addEventListener('mouseleave', swallow, true);
        document.addEventListener('mouseout', swallow, true);
    });
}

/**
 * Раздвигает окно до размеров страницы, чтобы кадр целой страницы снимался обычной съёмкой.
 *
 * Съёмка за пределы окна страницу не только снимает, но и трогает: браузер на время кадра
 * подменяет окно, страница получает `resize`, и то, что от размеров окна зависит, съезжает прямо
 * под затвором. Замер поймал это дважды в одной задаче — лента просмотрщика фото теряла
 * прокрутку (2624 → 2, и в кадр попадал первый снимок набора вместо последнего), высота страницы
 * уезжала на два пикселя. Успевает ли сдвиг лечь в растр, решает гонка, поэтому одна и та же
 * история то краснеет, то нет, и виноватой всякий раз выглядит другая.
 *
 * Обычное изменение окна ничего такого не делает: то же самое движение, сделанное **до** кадра и
 * с ожиданием вставшего показа после него, прокрутки не теряет — это проверено замером на той же
 * ленте. Отсюда порядок: сначала окно, потом успокоение, потом обычный кадр.
 *
 * Окно только растёт: снимаемая история могла назвать свою ширину порогом, и сужение окна до
 * страницы проверило бы ту сторону порога, о которой история не просила.
 */
async function fitViewportToPage(page: Page): Promise<void> {
    for (let attempt: number = 0; attempt < FIT_ATTEMPTS; attempt++) {
        const view: { width: number; height: number } | null = page.viewportSize();
        if (view === null) {
            return;
        }

        const box: { width: number; height: number } = await page.evaluate(() => ({
            width: Math.ceil(document.documentElement.scrollWidth),
            height: Math.ceil(document.documentElement.scrollHeight),
        }));

        if (box.width <= view.width && box.height <= view.height) {
            return;
        }

        await page.setViewportSize({
            width: Math.max(view.width, box.width),
            height: Math.max(view.height, box.height),
        });
        await quiet(page);
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
        await fitViewportToPage(page);
        image = await page.screenshot();
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

    async preVisit(page: Page, context: TestContext): Promise<void> {
        const story: Awaited<ReturnType<typeof getStoryContext>> = await getStoryContext(page, context);
        const snapshot: ISnapshotParameters = (story.parameters?.snapshot as ISnapshotParameters | undefined) ?? {};

        // Пометка без причины возвращает молчаливый пропуск, ради которого набор и задан
        // вычитанием: отличить «не снимается» от «забыли» нечем.
        if (snapshot.skip !== undefined && snapshot.skip.trim() === '') {
            throw new Error(`${context.id}: история помечена исключением без причины. Назови причину в storySnapshotSkip().`);
        }

        // Глушение ухода указателя ставится до отрисовки: панель, открытая в шаге истории,
        // успевала погаснуть уже к его концу, и подготовка кадра заставала пустую страницу.
        if (snapshot.overlay !== undefined) {
            await freezeHover(page);
        }

        await page.setViewportSize(VIEWPORT);
    },

    async postVisit(page: Page, context: TestContext): Promise<void> {
        const story: Awaited<ReturnType<typeof getStoryContext>> = await getStoryContext(page, context);
        const snapshot: ISnapshotParameters = (story.parameters?.snapshot as ISnapshotParameters | undefined) ?? {};

        // Снимается всё, кроме помеченного. Обратный порядок — «снимается помеченное» — дал бы
        // зелёный прогон и ноль проверенных пикселей у матрицы, при которой признак забыли.
        if (snapshot.skip !== undefined) {
            return;
        }

        await quiet(page);
        await requireOpenedOverlay(page, context.id, snapshot.overlay);
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

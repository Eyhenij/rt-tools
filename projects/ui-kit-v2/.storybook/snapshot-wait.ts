import type { Page } from 'playwright';

import { RT_ICON_SPRITE_ID, RT_ICON_SYMBOL_ID_PREFIX } from '../src/lib/components/icon/rt-icon.const.ts';

/**
 * Ожидание вставшего кадра для витрины второго кита.
 *
 * Вынесено из обвязки снимков: та отвечает на вопрос «сходится ли кадр с эталоном», а здесь —
 * ответ на другой, «дошла ли страница до кадра, который стоит снимать». Разошлись они по длине —
 * файл обвязки упёрся в предел, — но шов между ними был и до того: съёмка зовёт ожидание один
 * раз и целиком, а внутрь его не заглядывает.
 *
 * Своё, а не общее с первым китом: киты разведены намеренно, и правка ради второго сдвинула бы
 * момент съёмки у первого, то есть уронила бы его эталоны. В согласии две копии держит текст
 * правила проверки компонента, а не импорт.
 */

/** Признак корня показа: его ставят сетка, ряд и сравнение тем из `src/showcase/`. */
export const ROOT_SELECTOR: string = '[data-story-root]';

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

/**
 * Признак значка на странице: `<use>`, ссылающийся в набор.
 *
 * Значок кит рисует двумя разметками, и общего у них ровно это. Компонент `rt-icon` заводит свой
 * хост, а директива кнопки собирает голый `<svg class="rt-button__icon">` прямо в разметке
 * кнопки — хоста там нет ни одного. Ожидание, ходившее по хостам, страницу составной кнопки не
 * видело вовсе: замер даёт на ней ноль хостов и пять значков, и первая же строка ожидания
 * выпускала съёмку, не дождавшись набора.
 *
 * Ссылка берётся отсюда же, где её объявляет реестр: своё написание разошлось бы с ним молча —
 * ожидание искало бы одно, а реестр рисовал другое.
 */
const ICON_USE_SELECTOR: string = `use[href^="#${RT_ICON_SYMBOL_ID_PREFIX}"]`;

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
 * Признак компонента, чья начинка ещё не смонтирована. Ставит его сам компонент кита и снимает,
 * когда достроился: снаружи недостроенный компонент неотличим от достроенного пустого.
 */
const PENDING_SELECTOR: string = '[data-rt-pending]';

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

/**
 * Отказывает, если на странице есть значки, а к моменту кадра они не нарисованы.
 *
 * Набор едет по сети — три сотни файлов, склеенных реестром в один `<svg id="rt-icon-sprite">` в
 * начале `body`, — и до его прихода `<use href="#…">` не рисует ничего: кадр выходит без значков,
 * а раскладка ряда съезжает. Волновая пересъёмка закрепила четырьмя такими кадрами именно это.
 *
 * Ждётся тот же предмет, о котором отказ: сам нарисованный значок, а не косвенный его признак.
 * Наличие набора в разметке им не является — витрина пересобирает набор между историями, снимая
 * прежний и вставляя новый, и в этот промежуток набор на странице есть, а значок пуст.
 *
 * Ожидание не глушится и не молчит: страница со значками и страница без них различаются здесь
 * первым же условием, а кончившееся время поднимает отказ, называющий недостачу. Голый отказ по
 * времени говорит «ожидание не сошлось» и не говорит, где искать: в подаче набора или в
 * компоненте, который его не заметил.
 */
async function drawnIcons(page: Page, identifier: string): Promise<void> {
    const drawn: (args: [string, string]) => boolean = ([spriteId, useSelector]: [string, string]): boolean => {
        const uses: Element[] = Array.from(document.querySelectorAll(useSelector));
        const hosts: number = document.querySelectorAll('rt-icon').length;

        // Значков на странице нет вовсе — ждать нечего. Отличить это от «значки есть, а набора
        // нет» и было тем, чего прежнее ожидание не умело.
        if (uses.length === 0 && hosts === 0) {
            return true;
        }

        // Хост есть, а его `<use>` ещё не построен: пришедший ресурс и заметивший его компонент —
        // разное, и пустой перебор принял бы второе за готовность.
        if (uses.length === 0) {
            return false;
        }

        const sprite: HTMLElement | null = document.getElementById(spriteId);
        if (sprite === null || sprite.childElementCount === 0) {
            return false;
        }

        return uses.every((use: Element): boolean => {
            const box: DOMRect = use.getBoundingClientRect();
            if (box.width > 0 && box.height > 0) {
                return true;
            }

            // Значок, которого не видно самого (скрыт, свёрнут, за пределами показа), ничего не
            // говорит о готовности набора: его `<use>` пуст и с пришедшим набором.
            const owner: SVGSVGElement | null = (use as SVGUseElement).ownerSVGElement;
            if (owner === null) {
                return true;
            }
            const host: DOMRect = owner.getBoundingClientRect();
            return host.width === 0 || host.height === 0;
        });
    };

    try {
        await page.waitForFunction(drawn, [ICON_SPRITE_ID, ICON_USE_SELECTOR] as [string, string], { timeout: ICONS_TIMEOUT_MS });
    } catch {
        const report: { uses: number; hosts: number; symbols: number } = await page.evaluate(
            ([spriteId, useSelector]: [string, string]) => ({
                uses: document.querySelectorAll(useSelector).length,
                hosts: document.querySelectorAll('rt-icon').length,
                symbols: document.getElementById(spriteId)?.childElementCount ?? 0,
            }),
            [ICON_SPRITE_ID, ICON_USE_SELECTOR] as [string, string]
        );

        throw new Error(
            `${identifier}: значки не нарисованы к моменту кадра. На странице ${report.hosts} хостов и ` +
                `${report.uses} значков, в наборе ${report.symbols} символов. Кадр не снимается.`
        );
    }
}

/**
 * Доводит страницу до состояния, в котором две съёмки подряд совпадают: шрифты пришли, движение
 * остановлено, каркасные анимации доиграны, указатель уведён, значки нарисованы.
 */
export async function quiet(page: Page, identifier: string): Promise<void> {
    await page.evaluate(() => document.fonts.ready);

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

    // Значки ждутся последними, уже по вставшему показу. Раньше ожидание стояло первым — и на
    // странице, где значок появляется от смены ширины, проходило по разметке, в которой значка
    // ещё нет вовсе: отборник на широком экране рисует ряд кнопок, а на узком — список с
    // шевроном, и между сменой размера окна и подменой разметки ожидание успевало сойтись.
    await drawnIcons(page, identifier);
    await settled(page);
}

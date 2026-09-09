/**
 * Проверки полосы растушёвки над нижним краем списка: её цвет и стык с подвалом.
 *
 * Живут рядом с показом, а не в нём: файл историй упёрся в предел длины, и проверки одного
 * предмета вынесены целиком, как это уже сделано для полосы прокрутки и хватки разделителя.
 */
import { waitFor } from './side-menu.wait';

/** Полоса растушёвки над нижним краем списка — то, чей цвет спрашивает проверка схемы. */
const HINT_SELECTOR: string = '[qa-dataid="scrollable-scroll-hint"]';

/**
 * Ряды роли, которыми цветовая схема перекрашивает акцентный слой. Ровно то, что кладёт на
 * страницу блок `[data-rt-scheme]`: своей объявленной схемы у витрины нет, а проверке нужна не
 * схема с именем, а её приём.
 */
const SCHEME_PROBE: Readonly<Record<string, string>> = {
    '--rt-color-primary-20': '#b3e3e1',
    '--rt-color-primary-40': '#5cb8b5',
    '--rt-color-primary-60': '#1a9d99',
    '--rt-color-primary-100': '#008582',
};

/**
 * SC-UK-45 — проверка того, что растушёвка идёт за выбранной цветовой схемой и за темой.
 *
 * Цвет собирается из токенов, а токены разрешает браузер: в спеке `var()` остаётся строкой, и
 * взятая там растушёвка совпадает сама с собой при любой схеме. Поэтому спрашивается здесь —
 * вычисленным значением, снятым до и после перекраски.
 *
 * Схема и тема ставятся на корень страницы и снимаются в конце: снимок истории идёт после
 * показа, и оставленная схема увела бы эталон вслед за проверкой.
 */
export async function assertHintFollowsScheme(canvasElement: HTMLElement): Promise<void> {
    const hint: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null => canvasElement.querySelector(HINT_SELECTOR));

    if (hint === null) {
        throw new Error('Признака непоказанного снизу нет: красить нечего');
    }

    const root: HTMLElement = document.documentElement;
    const read: () => string = (): string => getComputedStyle(hint).backgroundImage;

    try {
        const plain: string = read();

        Object.entries(SCHEME_PROBE).forEach(([name, value]: [string, string]): void => root.style.setProperty(name, value));

        const scheme: string = read();

        if (scheme === plain) {
            throw new Error(`Растушёвка не пошла за схемой: цвет остался прежним — ${plain}`);
        }

        root.classList.add('rt-dark');

        const dark: string = read();

        if (dark === scheme) {
            throw new Error(`Растушёвка не различает тёмную тему при той же схеме: ${dark}`);
        }
    } finally {
        Object.keys(SCHEME_PROBE).forEach((name: string): void => {
            root.style.removeProperty(name);
        });
        root.classList.remove('rt-dark');
    }
}

/**
 * SC-UK-46 — проверка того, что растушёвка доходит до содержимого подвала, а не обрывается у края
 * списка.
 *
 * Между низом списка и первой строкой подвала стоит верхний отступ подвала — его задаёт
 * потребитель, и разделительную линию он рисует уже за ним. Полоса, кончающаяся у края списка,
 * оставляет между собой и линией чистый фон, и стык читается кривой вёрсткой.
 */
export async function assertHintReachesFooter(canvasElement: HTMLElement): Promise<void> {
    const hint: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null => canvasElement.querySelector(HINT_SELECTOR));

    if (hint === null) {
        throw new Error('Признака непоказанного снизу нет: мерить нечего');
    }

    const footer: HTMLElement | null = canvasElement.querySelector('.rtui-scrollable__footer');

    if (footer === null) {
        throw new Error('Подвала области нет: стыка, о котором проверка, не существует');
    }

    const footerBox: DOMRect = footer.getBoundingClientRect();
    const contentTop: number = footerBox.top + parseFloat(getComputedStyle(footer).paddingTop);
    const gap: number = contentTop - hint.getBoundingClientRect().bottom;

    if (Math.abs(gap) > 1) {
        throw new Error(`Между растушёвкой и содержимым подвала полоса чистого фона: ${Math.round(gap)} пикселей`);
    }
}

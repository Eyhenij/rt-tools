import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { BOOKINGS_FIXTURE, IBookingsFixture } from '../bookings/bookings.store';
import { TestRtBookingsTemplateComponent } from './component/test-bookings-template.component';

/**
 * Целый экран раздела, собранный из компонентов кита: каркас с верхней навигацией, заголовок
 * раздела с подсказкой, тулбар с отбором и действиями, таблица с тегами, копируемыми ячейками и
 * меню строки, переключатель страниц, панели заведения и правки записи.
 *
 * Уровень `Templates`, а не `Organisms`: это не компонент с осями входов, а образец сборки
 * страницы — то, что потребитель повторяет у себя. Договор о покрытии состояниями к нему не
 * относится по той же причине, по какой не относится к историям уровня основ: ни `Playground`,
 * ни `States` у целого экрана нет.
 */
export default {
    title: 'Templates/List Page',
    component: TestRtBookingsTemplateComponent,
} as Meta<TestRtBookingsTemplateComponent>;

type TStory = StoryObj<TestRtBookingsTemplateComponent>;

/**
 * Общие параметры показа целого экрана.
 *
 * `layout: 'fullscreen'` — без отступа обвязки: у приложения экран стоит от края до края, и
 * отступ витрины сдвинул бы и шапку, и страницу на свою величину. Кадр снимается целой
 * страницей, а не корнем показа: у этой истории рисует не сетка обвязки, а сам экран.
 */
const SCREEN_PARAMETERS: Record<string, unknown> = {
    layout: 'fullscreen',
    snapshot: { fullPage: true },
};

/** Ответ демонстрационного сервера для истории: тем же токеном, каким его читает стор. */
function fixture(value: IBookingsFixture): ReturnType<typeof applicationConfig> {
    return applicationConfig({ providers: [{ provide: BOOKINGS_FIXTURE, useValue: value }] });
}

/** Сколько ждать обещанного состояния, прежде чем сдаться и оставить кадр как есть. */
const AWAIT_TIMEOUT_MS: number = 10_000;

/** Как часто пересматривать разметку в ожидании. Кадр монитора при 60 Гц — 16 мс. */
const AWAIT_STEP_MS: number = 50;

/**
 * Ждёт обещанного состояния экрана перед съёмкой кадра.
 *
 * Ждётся признак, а не отсчёт времени: ответ «сервера» приходит с задержкой, и снимок, снятый
 * по таймеру, застаёт то скелетоны, то список — на свободной машине одно, на занятой другое.
 * Прогонщик снимков сам этого не ждёт: он считает кадр вставшим по неизменности размера показа,
 * а размер у экрана со скелетонами такой же неподвижный, как у экрана со списком.
 */
async function awaitScreen(canvas: HTMLElement, ready: (root: HTMLElement) => boolean): Promise<void> {
    const deadline: number = Date.now() + AWAIT_TIMEOUT_MS;

    while (Date.now() < deadline) {
        if (ready(canvas)) {
            return;
        }

        await new Promise<void>((resolve: () => void): void => {
            setTimeout(resolve, AWAIT_STEP_MS);
        });
    }
}

/**
 * Список заявок с открытым разделом. Панель заведения открывается кнопкой в тулбаре, панель
 * правки — кликом по строке; обе живут своим адресом и переживают перезагрузку страницы.
 */
export const Screen: TStory = {
    parameters: SCREEN_PARAMETERS,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await awaitScreen(canvasElement, (root: HTMLElement): boolean => root.querySelector('[qa-dataid="bookings-cell-dates"]') !== null);
    },
};

/**
 * Список, в котором нет ни одной записи. Показывает то, что видит владелец на пустом разделе:
 * таблица уступает место сообщению, а тулбар и переключатель страниц остаются на местах.
 */
export const Empty: TStory = {
    decorators: [fixture({ bookings: [], failing: false })],
    parameters: SCREEN_PARAMETERS,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await awaitScreen(canvasElement, (root: HTMLElement): boolean => root.querySelector('[qa-dataid="bookings-empty"]') !== null);
    },
};

/**
 * Чтение списка кончилось отказом. Пустая таблица при этом ничего не утверждает: сообщения
 * «заявок пока нет» здесь нет, а о случившемся владельцу говорит тост, и повторить чтение он
 * может кнопкой обновления.
 */
export const Failed: TStory = {
    decorators: [fixture({ bookings: [], failing: true })],
    parameters: SCREEN_PARAMETERS,

    // Кадр снимается после того, как тост отговорит своё: он живёт четыре секунды и уезжает
    // сам, и снимок, застающий его на полпути, расходился бы с эталоном через раз. Отказ виден
    // в кадре и без тоста — по таблице, которая молчит: сообщения «заявок пока нет» здесь нет.
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        // Сначала — появления тоста: он приходит ответом, и до него чтение ещё идёт. Отсутствие
        // тоста в начале ничего не значит — экран в этот момент даже не смонтирован.
        await awaitScreen(canvasElement, (root: HTMLElement): boolean => root.querySelector('[qa-dataid="toast"]') !== null);
        await awaitScreen(canvasElement, (root: HTMLElement): boolean => root.querySelector('[qa-dataid="toast"]') === null);
    },
};

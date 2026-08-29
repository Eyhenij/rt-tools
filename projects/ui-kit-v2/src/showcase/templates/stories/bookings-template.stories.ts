import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { SHOWCASE_BOOKINGS } from '../bookings/booking.data';
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

/** Признак того, что список приехал: первая ячейка строки. До него в кадре стоят скелетоны. */
const LIST_READY_SELECTOR: string = '[qa-dataid="bookings-cell-dates"]';

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
 * То же ожидание, но с отказом: не дождавшись, оно роняет историю, а не отпускает съёмку
 * дальше. Молчаливое ожидание отпускает кадр без того, чего ждали, и снимок уходит в сверку
 * недоигранным — отличить его от верного нечем, пока эталон не снят с пустоты.
 */
async function requireScreen(canvas: HTMLElement, ready: (root: HTMLElement) => boolean, what: string): Promise<void> {
    await awaitScreen(canvas, ready);

    if (!ready(canvas)) {
        throw new Error(`Не дождались: ${what}`);
    }
}

/**
 * Короткий набор для историй с раскрытым меню: страница при нём умещается в кадр целиком.
 * Кадр целой страницы прокручивает её, а перекрытие кита от прокрутки закрывается — на длинном
 * списке попап уезжал из кадра, и оба эталона закрепили бы шапку без него.
 */
const SHORT_BOOKINGS: IBookingsFixture = { bookings: SHOWCASE_BOOKINGS.slice(0, 3), failing: false };

/**
 * Список заявок с открытым разделом. Панель заведения открывается кнопкой в тулбаре, панель
 * правки — кликом по строке; обе живут своим адресом и переживают перезагрузку страницы.
 */
export const Screen: TStory = {
    parameters: SCREEN_PARAMETERS,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await awaitScreen(canvasElement, (root: HTMLElement): boolean => root.querySelector(LIST_READY_SELECTOR) !== null);
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

/**
 * Панель правки после удачной записи. Ответ на вопрос «получилось ли» приходит туда же, где
 * вопрос задан, — в панель, рядом с формой; панель при этом остаётся открытой, и закрывает её
 * человек. Прежде об удаче говорил тост у края экрана, а панель исчезала вместе с формой.
 *
 * Своя история ей нужна потому, что в кадре соседних этого состояния нет вовсе: сообщение
 * рисуется внутри панели и живёт ровно столько, сколько человек её не закрыл.
 */
export const EditSaved: TStory = {
    decorators: [fixture(SHORT_BOOKINGS)],
    parameters: SCREEN_PARAMETERS,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        // Адрес показа запоминается до первого перехода и возвращается на место в конце.
        // Панель живёт своим адресом, и роутер пишет его в адресную строку; обвязка снимков
        // держит все истории файла на одной странице, а обёртка экрана нарочно сохраняет уже
        // набранный адрес — чтобы панель переживала перезагрузку. Оставленный как есть, он
        // открывает панель и на следующих историях: два соседних эталона разошлись на три
        // четверти кадра, и виновата была не их вёрстка.
        const showcaseHref: string = window.location.href;

        await awaitScreen(canvasElement, (root: HTMLElement): boolean => root.querySelector(LIST_READY_SELECTOR) !== null);

        const row: HTMLElement | null = canvasElement.querySelector(LIST_READY_SELECTOR);

        if (row === null) {
            window.history.replaceState(null, '', showcaseHref);
            throw new Error('Строка списка не отрисована');
        }

        row.click();

        // Панель живёт своим адресом: до её отрисовки роутер успевает сменить адрес и поднять
        // компонент, а сущность приезжает ответом «сервера» ещё позже.
        await requireScreen(
            document.body,
            (root: HTMLElement): boolean => root.querySelector('[qa-dataid="booking-guest-name"] input') !== null,
            'панель правки с полями записи'
        );

        // Нетронутую форму панель не отправляет вовсе — кнопка записи у неё выключена, и
        // нажатие на неё не сделало бы ничего. История правит поле тем же путём, каким его
        // правит человек: значением и событием ввода, которое читает связка формы.
        const guestName: HTMLInputElement | null = document.body.querySelector('[qa-dataid="booking-guest-name"] input');

        if (guestName === null) {
            window.history.replaceState(null, '', showcaseHref);
            throw new Error('Поле имени гостя в панели не отрисовано');
        }

        guestName.value = 'Анна Северова-Ким';
        guestName.dispatchEvent(new Event('input', { bubbles: true }));

        // Ждётся не событие, а его следствие: кит собран без зоны, и признак тронутой формы
        // доезжает до кнопки следующим кругом обнаружения изменений. Нажатие сразу после ввода
        // приходится на ещё выключенную кнопку и не делает ничего — а ожидание, не знающее об
        // этом, отпустило бы съёмку с панелью без сообщения.
        await requireScreen(
            document.body,
            (root: HTMLElement): boolean => root.querySelector('[qa-dataid="booking-save"]:not([disabled])') !== null,
            'кнопка записи, включённая правкой поля'
        );

        const save: HTMLElement | null = document.body.querySelector('[qa-dataid="booking-save"]');

        if (save === null) {
            window.history.replaceState(null, '', showcaseHref);
            throw new Error('Кнопка записи в панели не отрисована');
        }

        save.click();

        await requireScreen(
            document.body,
            (root: HTMLElement): boolean => root.querySelector('[qa-dataid="booking-saved"]') !== null,
            'сообщение об удачной записи в панели'
        );

        // Сообщение доводится до видимой части: панель прокручивается внутри себя, и кадр целой
        // страницы её прокрутку не разворачивает — состояние, ради которого история заведена,
        // осталось бы за нижним краем панели, а снимок выглядел бы целым.
        document.body.querySelector('[qa-dataid="booking-saved"]')?.scrollIntoView({ block: 'center' });

        // Адресная строка возвращается на место, а показанное остаётся: роутер уже отрисовал
        // панель, и подмена адреса её не трогает. Кадр снимается с открытой панелью, а соседняя
        // история начинается с чистого раздела.
        window.history.replaceState(null, '', showcaseHref);
    },
};

/**
 * Панель второго уровня раскрыта. Кит открывает её наведением на раздел, а нажатие остаётся
 * запасным путём для касания — им и пользуется история: наведение, разыгранное из кода, до кадра
 * не доживает.
 */
export const SectionMenu: TStory = {
    decorators: [fixture(SHORT_BOOKINGS)],
    parameters: { ...SCREEN_PARAMETERS, snapshot: { fullPage: true, overlay: '[qa-dataid="header-nav-column"]' } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await awaitScreen(canvasElement, (root: HTMLElement): boolean => root.querySelector(LIST_READY_SELECTOR) !== null);

        const trigger: HTMLElement | null = canvasElement.querySelector('[data-id="settings"] [qa-dataid="header-nav-trigger"]');

        if (trigger === null) {
            throw new Error('Раздел с панелью второго уровня в шапке не отрисован');
        }

        trigger.click();

        // Панель живёт в перекрытии, а не внутри показа: ждётся она по документу целиком.
        await awaitScreen(document.body, (root: HTMLElement): boolean => root.querySelector('[qa-dataid="header-nav-column"]') !== null);
    },
};

/**
 * Попап профиля раскрыт: кто вошёл и в каком заведении, смена заведения, смена пароля, выход,
 * язык и тема. Открывается тем же движением, что и панель раздела, — весь верхний ряд ведёт себя
 * одинаково.
 */
export const ProfileMenu: TStory = {
    decorators: [fixture(SHORT_BOOKINGS)],
    parameters: { ...SCREEN_PARAMETERS, snapshot: { fullPage: true, overlay: '[qa-dataid="header-profile-menu"]' } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await awaitScreen(canvasElement, (root: HTMLElement): boolean => root.querySelector(LIST_READY_SELECTOR) !== null);

        const trigger: HTMLElement | null = canvasElement.querySelector('[qa-dataid="header-user-menu"]');

        if (trigger === null) {
            throw new Error('Юзер-блок в шапке не отрисован');
        }

        trigger.click();

        await awaitScreen(document.body, (root: HTMLElement): boolean => root.querySelector('[qa-dataid="header-profile-menu"]') !== null);
    },
};

import { signal } from '@angular/core';
import { applicationConfig, Decorator, Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { BreakpointsService } from '../../../platform';
import { TestRtAsideSheetComponent } from './component/test-aside-sheet.component';

/**
 * Служба брейкпоинтов с ответами окна заданной ширины. Вид шторки выбирается в миг открытия панели,
 * а окно историей не задать: узел, который служба перерисовала бы после смены окна, не получил бы
 * состояния витрины. Поэтому подменяется источник ответа — с первой отрисовки.
 */
function windowOf(width: number): BreakpointsService {
    const phone: boolean = width <= 480;
    const answers: Pick<
        BreakpointsService,
        'mobile' | 'tablet' | 'desktop' | 'narrow' | 'viewportNarrow' | 'belowNarrow' | 'phone' | 'placeWidth' | 'registerPlace'
    > = {
        mobile: signal(phone),
        tablet: signal(!phone),
        desktop: signal(false),
        narrow: signal(true),
        viewportNarrow: signal(true),
        belowNarrow: signal(true),
        phone: signal(phone),
        placeWidth: signal(width),
        registerPlace: (): (() => void) => (): void => undefined,
    };

    return answers as BreakpointsService;
}

/** Окно телефона из макета асайда-шторки. */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 375, height: 812 };

/** Узкое окно шире телефона: панель выезжает сбоку, как прежде. */
const SIDE_WINDOW: { readonly width: number; readonly height: number } = { width: 600, height: 812 };

/** Поднятая шторка панели: по ней кадр ждёт, что шторка встала на место. */
const OPEN_SHEET: string = '.rt-aside-overlay .rt-bottom-sheet--open';

const PHONE: Decorator = applicationConfig({ providers: [{ provide: BreakpointsService, useValue: windowOf(PHONE_WINDOW.width) }] });
const SIDE: Decorator = applicationConfig({ providers: [{ provide: BreakpointsService, useValue: windowOf(SIDE_WINDOW.width) }] });

/** Кадр шторки телефона: вся страница, оверлей шторки, окно 375×812. */
const PHONE_SHOT: { snapshot: { fullPage: boolean; overlay: string; viewport: typeof PHONE_WINDOW } } = {
    snapshot: { fullPage: true, overlay: OPEN_SHEET, viewport: PHONE_WINDOW },
};

/**
 * Асайд на телефоне — шторка во всю высоту. Каждая история — кадр одобренного макета: панель
 * записи, вопрос о правках внизу, отборы полосы, сведения рабочего стола, настройки колонок, вид
 * списка, панель приложения и вкладки каруселью; последняя — окно 600 точек, где панель сбоку.
 * Панели стоят в оверлее, поэтому кадр снимает всю страницу.
 */
export default {
    title: 'Organisms/Aside/AsideSheet',
    component: TestRtAsideSheetComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtAsideSheetComponent>;

type TStory = StoryObj<TestRtAsideSheetComponent>;

async function open({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await openStoryOverlay(canvasElement);
}

/** Отборы полосы открывает кнопка фильтров, как человек. */
async function openFilters({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await openStoryOverlay(canvasElement, { within: '[qa-dataid="toolbar-filters-trigger"] button' });
}

/** Запись с несохранёнными правками: «×» шторки задаёт вопрос внизу экрана. */
async function ask(context: { canvasElement: HTMLElement }): Promise<void> {
    await open(context);
    document.querySelector<HTMLElement>('.rt-aside-overlay [qa-dataid="aside-sheet-close"] button')?.click();
    await openStoryOverlay(context.canvasElement);
}

/**
 * Панель записи: «×», заголовок и справа значок меню с «Сохранить» в шапке; надзаголовок и бэйджи
 * под шапкой, сведения списком и раздел «Контакты».
 */
export const Record: TStory = {
    args: { frame: 'record' },
    decorators: [PHONE],
    parameters: PHONE_SHOT,
    play: open,
};

/** Вопрос о несохранённых правках внизу экрана над шторкой записи: первый ответ залит. */
export const UnsavedQuestion: TStory = {
    args: { frame: 'question' },
    decorators: [PHONE],
    parameters: { snapshot: { fullPage: true, overlay: '[qa-dataid="bottom-sheet-confirm"]', viewport: PHONE_WINDOW } },
    play: ask,
};

/** Отборы полосы: «Применить» справа в шапке, «Сбросить» в подвале, поля «Статус» и «Оплата». */
export const ToolbarFilters: TStory = {
    args: { frame: 'filters' },
    decorators: [PHONE],
    parameters: PHONE_SHOT,
    play: openFilters,
};

/** Сведения рабочего стола: надзаголовок «Сведения», заголовок из входа, без главной кнопки. */
export const WorkspaceDetails: TStory = {
    args: { frame: 'workspace' },
    decorators: [PHONE],
    parameters: PHONE_SHOT,
    play: open,
};

/** Настройка колонок таблицы в правой панели рамки: значок отмены и «Сохранить» в шапке. */
export const ColumnSettings: TStory = {
    args: { frame: 'columns' },
    decorators: [PHONE],
    parameters: { snapshot: { fullPage: true, overlay: '.rt-bottom-sheet--open', viewport: PHONE_WINDOW } },
    play: open,
};

/** Вид списка: переключатели вида, «Сохранить» в шапке; подвал с «Отменой» в шторке не рисуется. */
export const ListView: TStory = {
    args: { frame: 'list' },
    decorators: [PHONE],
    parameters: PHONE_SHOT,
    play: open,
};

/** Панель приложения «Новый тур»: поля контактов, «Сохранить» в шапке, «Удалить» в подвале. */
export const AppAside: TStory = {
    args: { frame: 'app' },
    decorators: [PHONE],
    parameters: PHONE_SHOT,
    play: open,
};

/** Вкладки записи каруселью: одна строка с затенёнными краями, «Бронирования» по центру. */
export const TabsCarousel: TStory = {
    args: { frame: 'tabs' },
    decorators: [PHONE],
    parameters: PHONE_SHOT,
    play: open,
};

/** Окно 600 точек: та же панель записи выезжает сбоку со стрелкой и подвалом, как прежде. */
export const SidePanelAt600: TStory = {
    args: { frame: 'record' },
    decorators: [SIDE],
    parameters: { snapshot: { fullPage: true, overlay: '.rt-aside-overlay', viewport: SIDE_WINDOW } },
    play: open,
};

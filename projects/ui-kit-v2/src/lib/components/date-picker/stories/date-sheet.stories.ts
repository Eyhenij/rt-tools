import { signal } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { BreakpointsService } from '../../../platform';
import { TestRtDateSheetComponent } from './component/test-date-sheet.component';

/** Служба точек перехода, всегда отвечающая «узкий экран»: шторка нужна узкому окну, а окно историей не задать. */
const NARROW_ANSWERS: Pick<BreakpointsService, 'mobile' | 'tablet' | 'desktop' | 'narrow' | 'viewportNarrow' | 'phone'> = {
    mobile: signal(true),
    tablet: signal(false),
    desktop: signal(false),
    narrow: signal(true),
    viewportNarrow: signal(true),
    phone: signal(true),
};

const NARROW_BREAKPOINTS: BreakpointsService = NARROW_ANSWERS as BreakpointsService;

/** Открытая шторка поля: по ней кадр ждёт, что панель уже показана. */
const OPEN_SHEET: string = '.rt-bottom-sheet--open';

/** Окно телефона из эскиза `Телефон · Дата и время`. */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 375, height: 812 };

/** Кнопка в конце поля открывает его шторку: первая кнопка поля — очистка, поэтому жест назван явно. */
const OPEN_BUTTON: string = '[qa-dataid$="-open"] button';

/**
 * Поля времени, даты со временем и периода на узком экране. Кнопка «Готово» или «Применить» стоит
 * справа в шапке шторки; время выбирается барабаном под полосой по центру.
 */
export default {
    title: 'Molecules/Forms/DateSheet',
    component: TestRtDateSheetComponent,
    decorators: [
        applicationConfig({
            providers: [{ provide: BreakpointsService, useValue: NARROW_BREAKPOINTS }],
        }),
    ],
    parameters: {
        controls: { disable: true },
        snapshot: { fullPage: true, overlay: OPEN_SHEET, viewport: PHONE_WINDOW },
    },
} as Meta<TestRtDateSheetComponent>;

type TStory = StoryObj<TestRtDateSheetComponent>;

async function open({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await openStoryOverlay(canvasElement, { within: OPEN_BUTTON });
}

/** Открывает шторку даты со временем и переходит на вкладку «Время». */
async function openTime(context: { canvasElement: HTMLElement }): Promise<void> {
    await open(context);
    const tabs: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>('.rt-bottom-sheet--open .rt-date-panel__tabs button');
    tabs[tabs.length - 1]?.click();
}

/** Время: барабан часов и минут, «Готово» справа в шапке, внизу — «Сейчас». */
export const Time: TStory = {
    args: { kind: 'time' },
    play: open,
};

/** Дата со временем, вкладка «Время»: барабан, «Применить» справа в шапке, внизу — выбранное значение. */
export const DateTime: TStory = {
    args: { kind: 'datetime-local' },
    play: openTime,
};

/** Период: «Применить» справа в шапке, внизу — длина периода и «Сбросить». */
export const Range: TStory = {
    args: { kind: 'range' },
    play: open,
};

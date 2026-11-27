import { Meta, StoryObj } from '@storybook/angular';

import { TestRtBottomSheetComponent } from './component/test-bottom-sheet.component';

/** Окно телефона из кадров макета ряда RT-3746. */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 375, height: 812 };

/** Открытая шторка: по ней кадр ждёт, что панель уже показана. */
const OPEN_SHEET: string = '.rt-bottom-sheet--open';

export default {
    title: 'Organisms/Aside/BottomSheet',
    component: TestRtBottomSheetComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        open: { control: { type: 'boolean' } },
        layout: { control: { type: 'select' }, options: ['plain', 'footer-action', 'header-icons'] },
    },
} as Meta<TestRtBottomSheetComponent>;

type TStory = StoryObj<TestRtBottomSheetComponent>;

/** Лист показан открытым: закрытый не рисует ничего, и кадр закрепил бы пустую страницу. */
export const Playground: TStory = {
    args: {
        open: true,
        layout: 'plain',
    },
};

/**
 * Главное действие в подвале: «Применить» на всю ширину, справка «7 дней» над ней по центру, сброс —
 * круглым значком справа в шапке. Кадр макета «Фильтры: «Применить» в подвале, «Сбросить» в шапке».
 */
export const FooterAction: TStory = {
    name: 'Главное действие в подвале',
    args: {
        open: true,
        layout: 'footer-action',
    },
    parameters: { snapshot: { fullPage: true, overlay: OPEN_SHEET, viewport: PHONE_WINDOW } },
};

/**
 * Два значка справа в шапке — «Дублировать» и «Удалить» с зазором 8, «Удалить» крайняя справа, заголовок
 * по центру, «Сохранить» в подвале. Кадр макета «Асайд записи: «Дублировать» и «Удалить» в шапке».
 */
export const HeaderIcons: TStory = {
    name: 'Значки в шапке',
    args: {
        open: true,
        layout: 'header-icons',
    },
    parameters: { snapshot: { fullPage: true, overlay: OPEN_SHEET, viewport: PHONE_WINDOW } },
};

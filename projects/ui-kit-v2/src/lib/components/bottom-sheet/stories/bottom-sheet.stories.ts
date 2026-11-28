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
        layout: { control: { type: 'select' }, options: ['plain', 'footer-action', 'header-icons', 'more'] },
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

/** Второй экран шторки: открытый и вставший на место первого. */
const MORE_SCREEN: string = '.rt-bottom-sheet--nested.rt-bottom-sheet--open';

/**
 * Дополнительное за «⋮»: кнопка стоит левее значка сброса, а её нажатие открывает второй экран той
 * же шторки — шеврон «назад», заголовок «Ещё» и шаблон приложения, здесь переключатель «Свободные».
 * История нажимает «⋮» сама: кадр закрепляет второй экран. Первый экран — в «Подвале» матрицы.
 * Кадры макета 8762:2095 и 8762:2124.
 */
export const MoreScreen: TStory = {
    name: 'Дополнительное за «⋮»',
    args: {
        open: true,
        layout: 'more',
    },
    parameters: { snapshot: { fullPage: true, overlay: MORE_SCREEN, viewport: PHONE_WINDOW } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await document.fonts.ready;
        canvasElement.querySelector<HTMLButtonElement>('[qa-dataid="bottom-sheet-more"] button')?.click();
    },
};

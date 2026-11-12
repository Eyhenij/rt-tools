import { Meta, StoryObj } from '@storybook/angular';

import { TestRtWorkspaceBreakpointComponent } from './component/test-workspace-breakpoint.component';

/**
 * Порог одной колонки из входа. На планшете список и середина стоят рядом, а панель сведений
 * открывается поверх окна с затемнением и кнопкой «Закрыть». На телефоне вид прежний: одна колонка.
 *
 * Порог считается от ширины окна, поэтому каждое состояние — своя история со своим окном.
 */
export default {
    title: 'Organisms/Workspace/Breakpoint',
    component: TestRtWorkspaceBreakpointComponent,
    parameters: { controls: { disable: true }, layout: 'fullscreen' },
} as Meta<TestRtWorkspaceBreakpointComponent>;

type TStory = StoryObj<TestRtWorkspaceBreakpointComponent>;

interface IFrame {
    readonly viewport: { readonly width: number; readonly height: number };
    readonly overlay?: string;
    readonly fullPage: boolean;
}

const TABLET: { readonly viewport: { readonly value: string } } = { viewport: { value: 'tablet' } };
const PHONE: { readonly viewport: { readonly value: string } } = { viewport: { value: 'phone' } };

// Рабочий стол занимает окно целиком и сеткой витрины не рисуется: кадр — вся страница
const TABLET_FRAME: IFrame = { viewport: { width: 768, height: 720 }, fullPage: true };
const PHONE_FRAME: IFrame = { viewport: { width: 375, height: 812 }, fullPage: true };
const PANEL: string = '[qa-dataid="workspace-aside-overlay-close"]';

/** Планшет: список и середина рядом, панель сведений закрыта. */
export const TabletColumns: TStory = { globals: TABLET, parameters: { snapshot: TABLET_FRAME } };

/** Планшет: панель сведений открыта поверх окна. */
export const TabletDetails: TStory = {
    globals: TABLET,
    parameters: { snapshot: { ...TABLET_FRAME, overlay: PANEL } },
    args: { open: true },
};

/** Планшет, тёмная тема: панель сведений открыта поверх окна. */
export const TabletDetailsDark: TStory = {
    globals: { ...TABLET, theme: 'dark' },
    parameters: { snapshot: { ...TABLET_FRAME, overlay: PANEL } },
    args: { open: true },
};

/** Телефон: одна колонка, вид прежний. */
export const Phone: TStory = { globals: PHONE, parameters: { snapshot: PHONE_FRAME } };

/** Телефон, тёмная тема. */
export const PhoneDark: TStory = { globals: { ...PHONE, theme: 'dark' }, parameters: { snapshot: PHONE_FRAME } };

/** Без входа порог держат стили: на планшете одна колонка, как раньше. */
export const TabletDefault: TStory = { globals: TABLET, parameters: { snapshot: TABLET_FRAME }, args: { breakpoint: null } };

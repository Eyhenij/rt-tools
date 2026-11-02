import { Meta, StoryObj } from '@storybook/angular';

import { IStorySnapshotHost } from '../../../../showcase';
import { TestRtServiceBlockPanelComponent } from './component/test-service-block-panel.component';

/**
 * Панель подключения службы целиком, шириной кадра: её снимок накладывается на кадр макета.
 * Контролов нет: история повторяет кадр, а не перебирает входы.
 */
export default {
    title: 'Molecules/ServiceBlock/Panel',
    component: TestRtServiceBlockPanelComponent,
    parameters: {
        controls: { disable: true },
        layout: 'fullscreen',
    },
} as Meta<TestRtServiceBlockPanelComponent>;

type TStory = StoryObj<TestRtServiceBlockPanelComponent>;

/** Окно кадра 1440 × 900: снимок целой страницы режется по панели и накладывается на кадр. */
const PANEL_SNAPSHOT: IStorySnapshotHost = { snapshot: { viewport: { width: 1440, height: 900 }, fullPage: true } };

export const Panel: TStory = { parameters: PANEL_SNAPSHOT };

/**
 * Окно 768 × 900 — порог панели: на нём панель кита занимает всё окно, а форма уже идёт узким
 * ритмом. Кадр держит обещание спеки о 16 под чертой блока службы и на этой ширине.
 */
const IN_FORM_SNAPSHOT: IStorySnapshotHost = { snapshot: { viewport: { width: 768, height: 900 }, fullPage: true } };

export const InForm: TStory = { parameters: IN_FORM_SNAPSHOT };

/** Окно телефона 375 × 902, как кадр эталона «Stripe · 375»: панель во весь экран, кнопки в одну строку. */
const PHONE_SNAPSHOT: IStorySnapshotHost = { snapshot: { viewport: { width: 375, height: 902 }, fullPage: true } };

export const Phone: TStory = { parameters: PHONE_SNAPSHOT };

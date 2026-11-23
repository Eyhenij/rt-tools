import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { TestRtPageHeaderEndComponent } from './component/test-page-header-end.component';

/**
 * Правая группа шапки: кнопки шаблонов `rtHeaderBell` и профиль стоят вместе у правого края через 8.
 * Кадр снимается на ширинах макета: 1440, 1080 — ряд ушёл в бургер, 768 и 375 — профиль одним
 * значком `user`.
 */
export default {
    title: 'Molecules/Navigation/PageHeaderEnd',
    component: TestRtPageHeaderEndComponent,
    parameters: {
        controls: { disable: true },
        layout: 'fullscreen',
        snapshot: {
            fullPage: true,
            viewport: { width: 1440, height: 400 },
            widths: [storyWidthAtMost(1080), storyWidthAtMost(768), 375],
        },
    },
} as Meta<TestRtPageHeaderEndComponent>;

type TStory = StoryObj<TestRtPageHeaderEndComponent>;

/** Одна кнопка и две — кнопка помощника перед колокольчиком; светлая тема. */
export const End: TStory = { args: { theme: 'light' } };

/** Тот же состав в тёмной теме. */
export const EndDark: TStory = { args: { theme: 'dark' } };

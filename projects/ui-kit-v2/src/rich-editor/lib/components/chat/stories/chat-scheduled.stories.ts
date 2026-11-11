import { Meta, StoryObj } from '@storybook/angular';

import { TestRtChatScheduledComponent } from './component/test-chat-scheduled.component';

/**
 * Отложенный ответ на узких ширинах: подпись срока и полоса над полем в разговоре 768 и 375.
 * Широкий кадр показывают `Scheduled` и `ComposerBar` страницы переписки.
 */
export default {
    title: 'Organisms/Chat/Scheduled',
    component: TestRtChatScheduledComponent,
    parameters: { controls: { disable: true }, layout: 'fullscreen', snapshot: { fullPage: true } },
} as Meta<TestRtChatScheduledComponent>;

export const Feed768: StoryObj<TestRtChatScheduledComponent> = {
    args: { width: 371, height: 732 },
    parameters: { snapshot: { fullPage: true, viewport: { width: 768, height: 732 } } },
};

export const Bar768: StoryObj<TestRtChatScheduledComponent> = {
    args: { width: 371, height: 732, editing: true },
    parameters: { snapshot: { fullPage: true, viewport: { width: 768, height: 732 } } },
};

export const Feed375: StoryObj<TestRtChatScheduledComponent> = {
    args: { width: 375, height: 742 },
    parameters: { snapshot: { fullPage: true, viewport: { width: 375, height: 742 } } },
};

export const Bar375: StoryObj<TestRtChatScheduledComponent> = {
    args: { width: 375, height: 436, editing: true },
    parameters: { snapshot: { fullPage: true, viewport: { width: 375, height: 436 } } },
};

/** Самая длинная подпись на узкой ширине: подвал переносится и остаётся внутри пузыря. */
export const LongLabel375: StoryObj<TestRtChatScheduledComponent> = {
    args: {
        width: 375,
        height: 742,
        dateLabel: 'Уйдёт 28 сентября 2026 года в 23:59 по времени адресата, если не отмените раньше',
    },
    parameters: { snapshot: { fullPage: true, viewport: { width: 375, height: 742 } } },
};

/** Неразрывная подпись на узкой ширине: она рвётся внутри пузыря, а не вылезает из него. */
export const UnbrokenLabel375: StoryObj<TestRtChatScheduledComponent> = {
    args: { width: 375, height: 742, dateLabel: 'Уйдёт-28-сентября-2026-года-в-23:59-по-времени-адресата-если-не-отмените' },
    parameters: { snapshot: { fullPage: true, viewport: { width: 375, height: 742 } } },
};

import { Meta, StoryObj } from '@storybook/angular';

import { STORY_STATE_ATTRIBUTE } from '../../../../../showcase/story-states';
import { TestRtAiChatPropertiesComponent } from './component/test-ai-chat-properties.component';

/**
 * Токены вида чата: ячейка по умолчанию и по ячейке на пункт. Токены ставит правило на элементе
 * `rt-ai-chat`, как у приложения. Фокус поля и показанные действия строк — отдельные истории:
 * фокус в документе один, а действия строки видны только под наведением или фокусом.
 */
export default {
    title: 'Organisms/Chat/AiChatProperties',
    component: TestRtAiChatPropertiesComponent,
    parameters: { controls: { disable: true } },
} as Meta<TestRtAiChatPropertiesComponent>;

type TStory = StoryObj<TestRtAiChatPropertiesComponent>;

const at: (state: string, target: string) => string = (state: string, target: string): string =>
    `[${STORY_STATE_ATTRIBUTE}='${state}'] ${target}`;

/** Шрифт, шапка, подсказки (и в узкой панели), подпись автора, фоны панели и поля. */
export const Properties: TStory = { args: { part: 'properties' } };

/** Поле в фокусе, «Отправить» под указателем и выбранная оценка — без токенов и в другом цвете. */
export const Focus: TStory = {
    name: 'Properties · focus',
    args: { part: 'focus' },
    parameters: {
        pseudo: {
            focusWithin: at('focus', '.rt-ai-prompt-input__box'),
            hover: [at('focus', '.rt-ai-prompt-input__send .rt-icon-button'), at('focus', "[qa-dataid='ai-chat-like'] .rt-icon-button")],
        },
    },
};

/** Беседы с показанными действиями строк: меню и кнопка удаления, без токенов и с токенами. */
export const RowActions: TStory = {
    name: 'Properties · row actions',
    args: { part: 'rowActions' },
    parameters: { pseudo: { hover: at('rows', '.rt-thread-list__row-wrap') } },
};

import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { provideRtKit } from '../../lib/config/rt-kit-config.providers';
import { STORY_STATE_ATTRIBUTE } from '../story-states';
import { TestRtKitClearTabbableComponent } from './component/test-kit-clear-tabbable.component';

/** Поле с признаком `cross`: фокус внутри поля и фокус с клавиши на его крестике. */
const CROSS: string = `[${STORY_STATE_ATTRIBUTE}='cross']`;

/**
 * История уровня основ, как соседняя `Kit Settings`: показывает умолчание, заданное киту одной
 * раздачей, — крестик очистки полей в обходе по Tab. Договор о покрытии состояний к ней не
 * относится — у неё нет ни осей входов, ни состояний.
 *
 * Настройки объявлены декоратором самой истории, а не в `preview.ts`: раздача в общей обвязке
 * поставила бы крестик в обход у каждого поля витрины.
 *
 * Фокус рисует аддон состояний: рамку поля — признак фокуса внутри на поле и на всём под ним, кольцо
 * крестика — фокус с клавиши на его кнопке.
 */
export default {
    title: 'Foundation/Design Tokens/Kit Clear Tabbable',
    component: TestRtKitClearTabbableComponent,
    decorators: [
        applicationConfig({
            providers: [provideRtKit({ components: { formControl: { clearTabbable: true } } })],
        }),
    ],
    parameters: {
        controls: { disable: true },
        pseudo: {
            focusWithin: `${CROSS}, ${CROSS} *`,
            focusVisible: `${CROSS} [qa-dataid$='-clear'] button.rt-icon-button`,
        },
    },
} as Meta<TestRtKitClearTabbableComponent>;

type TStory = StoryObj<TestRtKitClearTabbableComponent>;

export const KitClearTabbable: TStory = {};

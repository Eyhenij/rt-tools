import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtNotificationsBellMatrixComponent } from './component/test-notifications-bell-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/NotificationsBell',
    component: TestRtNotificationsBellMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtNotificationsBellMatrixComponent>;

type TStory = StoryObj<TestRtNotificationsBellMatrixComponent>;

export const Unread: TStory = { args: { part: 'unread' } };

/** Наведение и фокус стилизованы у кнопки внутри — аддон псевдосостояний получает спуск до неё. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('button') },
};

export const Themes: TStory = { args: { part: 'themes' } };

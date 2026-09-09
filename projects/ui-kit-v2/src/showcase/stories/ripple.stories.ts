import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../story-snapshot';
import { TestRtRippleComponent } from './component/test-ripple.component';

/**
 * История уровня основ, а не компонента: показывает приём, общий для всего кита, и поэтому лежит
 * при обвязке показа, а не в папке одного компонента. Договор о покрытии состояний к ней не
 * относится — у волны нет ни осей входа, ни состояний.
 */
export default {
    title: 'Foundation/Ripple',
    component: TestRtRippleComponent,
    parameters: {
        controls: { disable: true },
        ...storySnapshotSkip(
            'волна гаснет за полсекунды, а кадр берётся после того, как страница успокоилась: ' +
                'снимок вышел бы без волны и стал бы эталоном её отсутствия. Смотрят её живьём на витрине'
        ),
    },
} as Meta<TestRtRippleComponent>;

type TStory = StoryObj<TestRtRippleComponent>;

export const Ripple: TStory = {};

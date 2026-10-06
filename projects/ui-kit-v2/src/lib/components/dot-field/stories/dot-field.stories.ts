import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtDotFieldComponent } from './component/test-dot-field.component';

const MOVING: string = 'поле движется: кадр снимка зависит от минуты, в которую его сняли';

/**
 * У поля нет входов, поэтому `Playground` показывает одну сцену без контролов. Матриц осей нет:
 * осей тоже нет. Снимки не снимаются — поле движется.
 */
export default {
    title: 'Atoms/Feedback/Dot field',
    component: TestRtDotFieldComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDotFieldComponent>;

type TStory = StoryObj<TestRtDotFieldComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip(MOVING),
    args: { part: 'playground' },
};

export const Themes: TStory = {
    parameters: storySnapshotSkip(MOVING),
    args: { part: 'themes' },
};

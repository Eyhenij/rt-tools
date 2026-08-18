// eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { TestHeaderComponent } from './component/test-header.component';

export default {
    title: 'Components/Header',
    component: TestHeaderComponent,
    decorators: [
        applicationConfig({
            // eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
            providers: [provideAnimations()],
        }),
    ],
} as Meta<TestHeaderComponent>;

type TStory = StoryObj<TestHeaderComponent>;

export const Header: TStory = {
    args: {
        isMobile: false,
        isTabs: false,
        title: 'Header Title Example',
        content: 'Content example',
    },
};

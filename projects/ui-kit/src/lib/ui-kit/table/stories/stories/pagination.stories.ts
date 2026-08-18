// eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import TestPaginationComponent from '../pagination/test-pagination-component';

export default {
    title: 'Components/Pagination',
    component: TestPaginationComponent,
    decorators: [
        applicationConfig({
            // eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
            providers: [provideAnimations()],
        }),
    ],
} as Meta<TestPaginationComponent>;

type TStory = StoryObj<TestPaginationComponent>;

export const Pagination: TStory = {
    args: {
        isMobile: false,
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 10000,
            hasPrev: false,
            hasNext: true,
        },
    },
};

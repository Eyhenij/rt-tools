// eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { TestInfoBadgeComponent } from './component/test-info-badge/test-info-badge.component';
import { EInfoBadgeProperty } from './utils/enum/info-badge-property.enum';

export default {
    title: 'Components/InfoBadge',
    component: TestInfoBadgeComponent,
    decorators: [
        applicationConfig({
            // eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
            providers: [provideAnimations()],
        }),
    ],
} as Meta<TestInfoBadgeComponent>;

type TStory = StoryObj<TestInfoBadgeComponent>;

export const InfoBadgeColors: TStory = {
    args: { property: EInfoBadgeProperty.COLOR },
};

export const InfoBadgeSizes: TStory = {
    args: { property: EInfoBadgeProperty.SIZE },
};

export const InfoBadgeWithIcon: TStory = {
    args: { property: EInfoBadgeProperty.ICON },
};

export const InfoBadgeBold: TStory = {
    args: { property: EInfoBadgeProperty.BOLD },
};

export const InfoBadgeEllipsis: TStory = {
    args: { property: EInfoBadgeProperty.ELLIPSIS },
};

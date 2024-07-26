import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryFn, moduleMetadata } from '@storybook/angular';

import { BlockDirective, ElemDirective } from '../../../bem';
import { RtuiSideMenuComponent, RtuiSideMenuFooterDirective, RtuiSideMenuHeaderDirective } from '../menu/rtui-side-menu.component';
import { SideMenuWrapperComponent } from './component/side-menu-wrapper.component';

export default {
    title: 'Components/SideMenuWrapper',
    component: SideMenuWrapperComponent,
    decorators: [
        moduleMetadata({
            imports: [
                BrowserAnimationsModule,
                NgTemplateOutlet,
                MatButtonModule,
                MatIconModule,
                MatTooltipModule,
                RtuiSideMenuComponent,
                RtuiSideMenuFooterDirective,
                RtuiSideMenuHeaderDirective,
                BlockDirective,
                ElemDirective,
                SideMenuWrapperComponent,
            ],
        }),
    ],
    argTypes: {
        isMobile: { control: 'boolean' },
        currentUrl: { control: 'text' },
    },
} as Meta;

const Template: StoryFn<SideMenuWrapperComponent> = (args) => ({
    component: SideMenuWrapperComponent,
    props: args,
});

export const Default = Template.bind({});
Default.args = {
    isMobile: false,
};

export const MobileView = Template.bind({});
MobileView.args = {
    isMobile: true,
};

export const ActiveMenu = Template.bind({});
ActiveMenu.args = {
    isMobile: false,
    activeMenuIds: [24, 26, 29, 33, 35],
};

export const MobileActiveMenu = Template.bind({});
MobileActiveMenu.args = {
    isMobile: true,
    activeMenuIds: [24, 26, 29, 33, 35],
};

import { Meta, StoryFn, moduleMetadata } from '@storybook/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgTemplateOutlet } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SideMenuWrapperComponent } from './component/side-menu-wrapper.component';
import { RtuiSideMenuComponent, RtuiSideMenuFooterDirective, RtuiSideMenuHeaderDirective } from '../menu/rtui-side-menu.component';
import { BlockDirective, ElemDirective } from '../../../bem';

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
                SideMenuWrapperComponent
            ],
        })
    ],
    argTypes: {
        isMobile: { control: 'boolean' },
        currentUrl: { control: 'text' }
    }
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
    activeMenuIds: [1, 3],
};

export const MobileActiveMenu = Template.bind({});
MobileActiveMenu.args = {
    isMobile: true,
    activeMenuIds: [1, 3],
};

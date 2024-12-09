import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { RtuiHeaderCenterDirective, RtuiHeaderComponent, RtuiHeaderRightDirective } from '../../header.component';

@Component({
    selector: 'app-header',
    templateUrl: './test-header.component.html',
    styleUrls: ['./test-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        MatButton,
        MatIcon,
        MatIconButton,
        MatTabGroup,
        MatTab,

        // directives
        BlockDirective,
        ElemDirective,
        RtuiHeaderCenterDirective,
        RtuiHeaderRightDirective,

        // components
        RtuiHeaderComponent,
    ],
    providers: [],
})
export class TestHeaderComponent {
    public isMobile: boolean = false;
    public isTabs: boolean = false;
    public title: string = '';
    public content: string = '';

    public openMobileMenu(): void {
        // eslint-disable-next-line no-console
        console.log('OpenMobileMenuAction');
    }
}

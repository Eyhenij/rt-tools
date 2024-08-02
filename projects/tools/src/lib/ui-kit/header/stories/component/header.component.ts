import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { RtuiHeaderCenterDirective, RtuiHeaderComponent, RtuiHeaderRightDirective } from '../../header.component';

@Component({
    standalone: true,
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
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
export class HeaderComponent {
    public isMobile: boolean = false;
    public isTabs: boolean = false;
    public title: string = '';
    public content: string = '';

    public openMobileMenu(): void {
        console.log('OpenMobileMenuAction');
    }
}

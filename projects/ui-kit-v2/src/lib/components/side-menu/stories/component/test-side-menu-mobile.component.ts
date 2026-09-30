import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { BreakpointsService } from '../../../../platform/breakpoints.service';
import { RtButtonDirective } from '../../../button';
import { RtIconComponent } from '../../../icon';
import { RtSideMenuFooterDirective, RtSideMenuHeaderDirective } from '../../rt-side-menu.directives';
import { RtSideMenuComponent } from '../../rt-side-menu.component';
import { TestRtSideMenuComponent } from './test-side-menu.component';

/**
 * То же живое меню на экране телефона — как истории `Mobile` и `Mobile active menu` первого кита.
 * Узкий экран задан службой точек перехода, а не шириной окна: кадр снимается в окне 1280, и
 * порог 1080 по ширине окна в нём не сработал бы.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-side-menu-mobile',
    templateUrl: './test-side-menu.component.html',
    styleUrls: ['./test-side-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // directives
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtSideMenuFooterDirective,
        RtSideMenuHeaderDirective,

        // components
        RtIconComponent,
        RtSideMenuComponent,
    ],
    providers: [{ provide: BreakpointsService, useValue: { narrow: signal<boolean>(true) } }],
    host: { class: 'app-side-menu' },
})
export class TestRtSideMenuMobileComponent extends TestRtSideMenuComponent {}

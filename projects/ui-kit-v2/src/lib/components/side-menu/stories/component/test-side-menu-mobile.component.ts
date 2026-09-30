import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtButtonDirective } from '../../../button';
import { RtIconComponent } from '../../../icon';
import { RtSideMenuFooterDirective, RtSideMenuHeaderDirective } from '../../rt-side-menu.directives';
import { RtSideMenuComponent } from '../../rt-side-menu.component';
import { TestRtSideMenuComponent } from './test-side-menu.component';

/**
 * То же живое меню на экране телефона — как истории `Mobile` и `Mobile active menu` первого кита.
 * Узкий экран кит определяет сам, по ширине окна: истории ставят окно телефона и в витрине, и в
 * кадре. Обёртка отдельная, потому что её история рисует меню своим шаблоном.
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
    host: { class: 'app-side-menu' },
})
export class TestRtSideMenuMobileComponent extends TestRtSideMenuComponent {}

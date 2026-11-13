import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Injector, Signal, ViewEncapsulation } from '@angular/core';

import { RT_ASIDE_DATA, RtAsideComponent, RtAsideFooterComponent, RtAsideHeaderComponent, RtAsideRef } from '@rt-tools/ui-kit-v2/aside';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { IRtWorkspace } from './rt-workspace.model';

const BEM_BLOCK: string = 'rt-workspace-aside-overlay';

/**
 * Панель сведений рабочего стола, открытая поверх окна: обычный `rt-aside` — шапка со стрелкой назад,
 * надписью «Сведения» и заголовком из входа рабочего стола, шаблон панели приложения и кнопка
 * «Закрыть» в подвале. Открывает её сам рабочий стол; наружу компонент не отдаётся.
 */
@Component({
    selector: 'rt-workspace-aside-overlay',
    templateUrl: './rt-workspace-aside-overlay.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,

        // standalone components / directives
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtButtonDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtWorkspaceAsideOverlayComponent {
    readonly #asideRef: RtAsideRef<void> = inject<RtAsideRef<void>>(RtAsideRef);

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly data: IRtWorkspace.AsideOverlayData = inject<IRtWorkspace.AsideOverlayData>(RT_ASIDE_DATA);

    /** Шаблон приложения получает инжектор панели: кнопки внутри него могут закрыть её сами */
    protected readonly injector: Injector = inject(Injector);

    /** Панель не шире окна: на телефонной ширине она занимает его целиком */
    protected readonly width: string = `min(${this.data.width}px, 100dvw)`;

    protected close(): void {
        this.#asideRef.close();
    }
}

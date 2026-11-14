import { NgComponentOutlet } from '@angular/common';
import { computed, inject, viewChild, ChangeDetectionStrategy, Component, Injector, Signal, Type } from '@angular/core';

import { RtDialogRef } from '../../../dialog/rt-dialog-ref';
import { RT_DIALOG_DATA } from '../../../dialog/rt-dialog.tokens';
import { RtPdfViewerErrorDirective } from '../../rt-pdf-viewer-error.directive';
import { IRtPdfViewer } from '../../rt-pdf-viewer.model';
import { RtPdfViewerComponent } from '../../rt-pdf-viewer.component';
import { provideRtPdfViewer } from '../../rt-pdf-viewer.tokens';
import { STORY_DIALOG_REF, STORY_DOCUMENT } from './test-pdf-viewer.component';

/** Рисовальщик, который отказывает сразу, — так же выглядит и нечитаемый документ. */
function failsToLoad(): Promise<IRtPdfViewer.PdfJs> {
    return Promise.reject(new Error('the showcase refuses the document on purpose'));
}

/**
 * Свой вид ошибки `rt-pdf-viewer` — по одобренному кадру. Просмотрщик открывает сервис диалога, и
 * шаблон доходит до него полем `errorTemplate` данных открытия: обёртка держит
 * `<ng-template rtPdfViewerError>`, как держит его потребитель, и раздаёт данные своим внедрением.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-pdf-viewer-states',
    template: `
        <ng-template rtPdfViewerError>
            <div [style]="slotStyle">
                <strong>Свой вид ошибки</strong>
                <span [style]="slotHintStyle">В контексте шаблона: текст ошибки ($implicit) и download()</span>
            </div>
        </ng-template>

        @if (viewerInjector(); as injector) {
            <ng-container *ngComponentOutlet="viewer; injector: injector" />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgComponentOutlet,

        // directives
        RtPdfViewerErrorDirective,
    ],
})
export class TestRtPdfViewerStatesComponent {
    readonly #injector: Injector = inject(Injector);

    protected readonly errorSlot: Signal<RtPdfViewerErrorDirective> = viewChild.required(RtPdfViewerErrorDirective);

    /** Данные открытия со своим шаблоном ошибки — те же, что потребитель отдаёт сервису диалога. */
    protected readonly viewerInjector: Signal<Injector> = computed((): Injector =>
        Injector.create({
            parent: this.#injector,
            providers: [
                { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
                { provide: RT_DIALOG_DATA, useValue: { ...STORY_DOCUMENT, errorTemplate: this.errorSlot().templateRef } },
                provideRtPdfViewer({ load: failsToLoad }),
            ],
        })
    );

    protected readonly viewer: Type<RtPdfViewerComponent> = RtPdfViewerComponent;

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. */
    protected readonly slotStyle: string =
        'display: grid; justify-items: center; gap: var(--rt-space-2); padding: var(--rt-space-6); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); color: var(--rt-color-text-inverse); text-align: center';

    protected readonly slotHintStyle: string = 'font-size: var(--rt-text-sm)';
}

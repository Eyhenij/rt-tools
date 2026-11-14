import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtPdfViewer } from './rt-pdf-viewer.model';

/**
 * Свой вид ошибки просмотрщика: `<ng-template rtPdfViewerError>` встаёт вместо заглушки «Не удалось
 * открыть документ». Просмотрщик открывает сервис диалога, разметки хозяина у него нет, поэтому
 * шаблон доходит до него полем `errorTemplate` данных открытия:
 *
 * ```html
 * <ng-template rtPdfViewerError let-text let-download="download">
 *     <p>{{ text }}</p>
 *     <button type="button" (click)="download()">Скачать</button>
 * </ng-template>
 * ```
 *
 * ```typescript
 * protected readonly pdfError = viewChild.required(RtPdfViewerErrorDirective);
 * this.#dialog.open(RtPdfViewerComponent, { data: { source, fileName, errorTemplate: this.pdfError().templateRef } });
 * ```
 *
 * Ошибка остаётся внутренней: повтора у просмотрщика нет, документ — файл потребителя.
 */
@Directive({
    selector: 'ng-template[rtPdfViewerError]',
})
export class RtPdfViewerErrorDirective {
    public readonly templateRef: TemplateRef<IRtPdfViewer.ErrorContext> = inject<TemplateRef<IRtPdfViewer.ErrorContext>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до текста ошибки и скачивания. */
    public static ngTemplateContextGuard(
        _directive: RtPdfViewerErrorDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtPdfViewer.ErrorContext {
        return true;
    }
}

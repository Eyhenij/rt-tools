import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ModDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-dialog-footer';

/** Как подвал раскладывает содержимое: к началу, по центру, к концу или по обоим краям. */
export type TRtDialogFooterAlign = 'start' | 'center' | 'end' | 'between';

/**
 * Footer-слот для композиции внутри `<rt-dialog>`. Принимает любой проектированный
 * контент (action-кнопки, статусные сообщения и т.п.), оборачивает в footer с
 * top-border и flex-раскладкой; вход `align` прижимает содержимое к концу (по умолчанию),
 * к началу, к центру или разводит по краям (`between`).
 *
 * `ViewEncapsulation.None` — для единообразия с rt-dialog.
 *
 * @example
 * \`\`\`html
 * <rt-dialog-footer>
 *   <button rtButton (click)="cancel()">Отмена</button>
 *   <button rtButton theme="primary" (click)="save()">Сохранить</button>
 * </rt-dialog-footer>
 * \`\`\`
 */
@Component({
    selector: 'rt-dialog-footer',
    templateUrl: './rt-dialog-footer.component.html',
    styleUrl: './rt-dialog-footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [BlockDirective, ModDirective],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtDialogFooterComponent {
    public readonly align: InputSignal<TRtDialogFooterAlign> = input<TRtDialogFooterAlign>('end');
}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-dialog-footer';

/**
 * Footer-слот для композиции внутри `<rt-dialog>`. Принимает любой проектированный
 * контент (action-кнопки, статусные сообщения и т.п.), оборачивает в footer с
 * top-border и flex-раскладкой `justify-content: flex-end`.
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
    imports: [BlockDirective],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtDialogFooterComponent {}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-dialog-content';

/**
 * Тело модалки для композиции внутри `<rt-dialog>` между шапкой и подвалом. Даёт отступ и
 * прокрутку: длинное содержимое прокручивается внутри тела, а шапка и подвал стоят на месте.
 * Отступ задаёт `--rt-dialog-content-padding`, потолок высоты — `--rt-dialog-content-max-height`.
 *
 * Часть необязательная: окно со своей обёрткой тела выглядит как прежде.
 *
 * @example
 * \`\`\`html
 * <rt-dialog size="md">
 *   <rt-dialog-header title="Создание записи" />
 *   <rt-dialog-content>...форма...</rt-dialog-content>
 *   <rt-dialog-footer>...</rt-dialog-footer>
 * </rt-dialog>
 * \`\`\`
 */
@Component({
    selector: 'rt-dialog-content',
    templateUrl: './rt-dialog-content.component.html',
    styleUrl: './rt-dialog-content.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [BlockDirective],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtDialogContentComponent {}

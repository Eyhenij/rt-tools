import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-file-list';

/**
 * Вертикальный контейнер для карточек файлов (`rt-file-card`): задаёт отступы между
 * карточками и растягивает их по ширине. Чисто презентационный — содержимое
 * проецируется через `<ng-content />`, логику списка держит caller.
 */
@Component({
    selector: 'rt-file-list',
    templateUrl: './rt-file-list.component.html',
    styleUrls: ['./rt-file-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtFileListComponent {}

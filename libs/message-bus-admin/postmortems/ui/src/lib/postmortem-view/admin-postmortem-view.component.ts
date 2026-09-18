import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { AdminMomentPipe } from '@rt/message-bus-admin/common/core/ui';
import { AdminTextService } from '@rt/message-bus-admin/common/core/util';
import { IPostmortem } from '@rt/message-bus-admin/postmortems/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtAsideSectionComponent, RtDetailListComponent, RtDetailRowComponent, RtMarkdownTextComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-panel';

/**
 * Вид одного разбора: поля записи и её текст.
 *
 * Пока запись читается, названия свойств уже стоят, а на месте значений — скелетоны: их даёт
 * готовая строка кита. Записи при этом ещё нет вовсе, поэтому вход принимает и пустоту; текст
 * в это время не показывается — прежний принадлежит прежней записи, а нового ещё нет.
 *
 * Текст показывается разметкой — компонентом кита: разбирается закрытый перечень разметки
 * `.md`, а сырой HTML узлом не становится вовсе и виден текстом как есть.
 *
 * Текст починки показывается как есть, отдельным разделом выше: он приходит строкой правки
 * состояния, разметкой не бывает, и у записи без починки раздела нет вовсе.
 *
 * Своего состояния у вида нет — запись приходит входом: читает её панель, а показывает он.
 */
@Component({
    selector: 'admin-postmortem-view',
    templateUrl: './admin-postmortem-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        RtAsideSectionComponent,
        RtDetailListComponent,
        RtDetailRowComponent,
        RtMarkdownTextComponent,

        // pipes
        AdminMomentPipe,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminPostmortemViewComponent {
    readonly #text: AdminTextService = inject(AdminTextService);

    protected readonly treeLabel: Signal<string> = computed((): string => this.#text.text('columnTree'));
    protected readonly fileLabel: Signal<string> = computed((): string => this.#text.text('columnFile'));
    protected readonly arrivedLabel: Signal<string> = computed((): string => this.#text.text('columnArrivedAt'));
    protected readonly updatedLabel: Signal<string> = computed((): string => this.#text.text('columnUpdatedAt'));
    protected readonly textLabel: Signal<string> = computed((): string => this.#text.text('detailsText'));
    protected readonly fixNoteLabel: Signal<string> = computed((): string => this.#text.text('detailsFixNote'));
    protected readonly releaseVersionLabel: Signal<string> = computed((): string => this.#text.text('releaseVersion'));

    public readonly entity: InputSignal<IPostmortem.State | null> = input.required<IPostmortem.State | null>();
    public readonly reading: InputSignal<boolean> = input<boolean>(false);
}

import {
    computed,
    inject,
    input,
    output,
    signal,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';

import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { ERtPageHeaderEntry, IRtPageHeaderView } from '../rt-page-header.logic';

const BEM_BLOCK: string = 'rt-page-phone-menu';

/**
 * Столбец разделов вертикальной шапки на телефоне. Раздел с панелью открывает свои пункты на месте
 * списка, «Назад» возвращает к разделам. Логотипа в столбце нет: он остаётся у рейки.
 */
@Component({
    selector: 'rt-page-phone-menu',
    templateUrl: './rt-page-phone-menu.component.html',
    styleUrl: './rt-page-phone-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, RtIconComponent, BlockDirective, ElemDirective, ModDirective],
    host: { class: BEM_BLOCK },
})
export class RtPagePhoneMenuComponent {
    readonly #openId: WritableSignal<string | null> = signal<string | null>(null);

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly EntryKind: typeof ERtPageHeaderEntry = ERtPageHeaderEntry;

    protected readonly openSection: Signal<IRtPageHeaderView.Section | null> = computed(
        (): IRtPageHeaderView.Section | null =>
            this.sections().find(
                (section: IRtPageHeaderView.Section): boolean => section.id === this.#openId() && section.kind === ERtPageHeaderEntry.Panel
            ) ?? null
    );

    public readonly sections: InputSignal<ReadonlyArray<IRtPageHeaderView.Section>> =
        input.required<ReadonlyArray<IRtPageHeaderView.Section>>();

    public readonly activeIds: InputSignal<ReadonlySet<string>> = input.required<ReadonlySet<string>>();

    public readonly navLabel: InputSignal<string> = input<string>('');

    public readonly itemClick: OutputEmitterRef<string> = output<string>();

    /** Выбран пункт: столбец больше не нужен. */
    public readonly closed: OutputEmitterRef<void> = output<void>();

    protected openPanel(id: string): void {
        this.#openId.set(id);
    }

    protected back(): void {
        this.#openId.set(null);
    }

    protected onButton(entry: IRtPageHeaderView.Entry): void {
        if (entry.disabled) {
            return;
        }
        this.itemClick.emit(entry.id);
        this.closed.emit();
    }
}

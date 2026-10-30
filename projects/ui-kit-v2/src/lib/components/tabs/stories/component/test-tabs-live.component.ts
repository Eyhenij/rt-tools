import { ChangeDetectionStrategy, Component, computed, input, InputSignal, Signal, signal, WritableSignal } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtToolbarCenterDirective, RtToolbarComponent, RtToolbarLeftDirective } from '../../../toolbar/rt-toolbar.component';
import { RtTabDirective } from '../../rt-tab.directive';
import { RtTabsComponent } from '../../rt-tabs.component';
import { IRtTabs } from '../../rt-tabs.model';

/** Какой показ рисовать: закрываемые вкладки или полосу без панели. */
export type TTabsLiveKind = 'closable' | 'headerOnly';

interface IReport {
    readonly id: string;
    readonly label: string;
}

const REPORTS: readonly IReport[] = [
    { id: 'occupancy', label: 'Загрузка' },
    { id: 'revenue', label: 'Выручка' },
    { id: 'guests', label: 'Гости' },
    { id: 'cancellations', label: 'Отмены' },
];

const SECTIONS: readonly IReport[] = [
    { id: 'rooms', label: 'Номера' },
    { id: 'rates', label: 'Тарифы' },
    { id: 'services', label: 'Услуги' },
];

/**
 * Вкладки с живым состоянием для витрины: набор закрываемых вкладок и полоса-навигация.
 *
 * Показ — отдельный компонент, чтобы у каждой половины пары наборов было своё состояние: закрытая
 * в одной половине вкладка не пропадает из другой.
 */
@Component({
    selector: 'app-tabs-live',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        @if (kind() === 'closable') {
            <div class="app-tabs-live">
                <rt-tabs [activeId]="activeId()" (activeIdChange)="activeId.set($event)" (tabClose)="close($event)">
                    @for (report of reports(); track report.id) {
                        <ng-template closable closeTooltip="Закрыть" [rtTab]="report.id" [label]="report.label">
                            Отчёт «{{ report.label }}»
                        </ng-template>
                    }
                    <ng-template rtTab="archive" label="Архив" closable disabled tooltip="Архив закрыт на пересчёт">Архив</ng-template>
                </rt-tabs>
                <div class="app-tabs-live__footer">
                    <span class="app-tabs-live__note">Закрыто: {{ closedText() }}</span>
                    <button rtButton qa-dataid="tabs-live-reset" type="button" size="sm" appearance="outlined" (click)="reset()">
                        Вернуть вкладки
                    </button>
                </div>
            </div>
        } @else {
            <div class="app-tabs-live">
                <rt-toolbar>
                    <ng-template rtToolbarLeft>
                        <span class="app-tabs-live__title">Объект</span>
                    </ng-template>
                    <ng-template rtToolbarCenter>
                        <rt-tabs headerOnly [activeId]="activeId()" (activeIdChange)="activeId.set($event)">
                            @for (section of sections; track section.id) {
                                <ng-template [rtTab]="section.id" [label]="section.label" />
                            }
                        </rt-tabs>
                    </ng-template>
                </rt-toolbar>
                <p class="app-tabs-live__note">Содержимое раздела «{{ sectionLabel() }}» живёт вне вкладок.</p>
            </div>
        }
    `,
    // native-ok: обёртка истории витрины — правила показа живут рядом с ним, а не отдельным файлом
    styles: `
        .app-tabs-live {
            display: flex;
            flex-direction: column;
            gap: var(--rt-space-md);
            inline-size: 36rem;
        }

        .app-tabs-live__footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--rt-space-md);
        }

        .app-tabs-live__note {
            margin: 0;
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-xs);
        }

        .app-tabs-live__title {
            font-weight: var(--rt-font-weight-semibold);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTabsComponent,
        RtToolbarComponent,

        // directives
        RtButtonDirective,
        RtTabDirective,
        RtToolbarCenterDirective,
        RtToolbarLeftDirective,
    ],
})
export class TestRtTabsLiveComponent {
    public readonly kind: InputSignal<TTabsLiveKind> = input<TTabsLiveKind>('closable');

    public readonly sections: readonly IReport[] = SECTIONS;
    public readonly reports: WritableSignal<readonly IReport[]> = signal<readonly IReport[]>(REPORTS);
    public readonly closed: WritableSignal<readonly string[]> = signal<readonly string[]>([]);
    public readonly activeId: WritableSignal<IRtTabs.Id | null> = signal<IRtTabs.Id | null>(null);

    public readonly closedText: Signal<string> = computed((): string => this.closed().join(', ') || 'ничего');

    public readonly sectionLabel: Signal<string> = computed(
        (): string => SECTIONS.find((section: IReport): boolean => section.id === this.activeId())?.label ?? SECTIONS[0].label
    );

    public close(id: IRtTabs.Id): void {
        const report: IReport | undefined = this.reports().find((item: IReport): boolean => item.id === id);
        if (!report) {
            return;
        }

        this.reports.update((items: readonly IReport[]): readonly IReport[] => items.filter((item: IReport): boolean => item.id !== id));
        this.closed.update((names: readonly string[]): readonly string[] => [...names, report.label]);
    }

    public reset(): void {
        this.reports.set(REPORTS);
        this.closed.set([]);
    }
}

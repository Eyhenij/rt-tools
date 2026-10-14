import { ChangeDetectionStrategy, Component, input, InputSignal, signal, WritableSignal } from '@angular/core';

import { RtCheckboxComponent } from '../../../checkbox/rt-checkbox.component';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtInputComponent } from '../../../input/rt-input.component';
import { RtExpansionPanelActionsDirective } from '../../rt-expansion-panel-actions.directive';
import { RtExpansionPanelContentDirective } from '../../rt-expansion-panel-content.directive';
import { RtExpansionPanelGroupDirective } from '../../rt-expansion-panel-group.directive';
import { RtExpansionPanelComponent } from '../../rt-expansion-panel.component';

/** Какой показ рисовать: действия в заголовке, группу панелей или сохранение тела. */
export type TExpansionPanelLiveKind = 'actions' | 'group' | 'preserve';

interface IGroupItem {
    readonly id: string;
    readonly title: string;
    readonly text: string;
}

const GROUP_ITEMS: readonly IGroupItem[] = [
    { id: 'rooms', title: 'Номера', text: 'Сорок два номера на четырёх этажах.' },
    { id: 'rates', title: 'Тарифы', text: 'Базовый, невозвратный и семейный.' },
    { id: 'services', title: 'Услуги', text: 'Завтрак, трансфер и поздний выезд.' },
];

/**
 * Раскрывающиеся панели с живым состоянием для витрины: действия в заголовке, группа «открыта
 * одна» рядом с группой `multi`, и тело, которое переживает сворачивание.
 *
 * Показ — отдельный компонент, чтобы у каждой половины пары наборов было своё состояние.
 */
@Component({
    selector: 'app-expansion-panel-live',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        @switch (kind()) {
            @case ('actions') {
                <div class="app-expansion-panel-live">
                    <rt-expansion-panel [(expanded)]="actionsOpen">
                        <span class="app-expansion-panel-live__title">Номера</span>
                        <span rtExpansionPanelActions class="app-expansion-panel-live__actions">
                            <rt-checkbox qa-dataid="expansion-live-publish" [checked]="published()" (checkedChange)="published.set($event)">
                                На сайте
                            </rt-checkbox>
                            <rt-icon-button
                                qa-dataid="expansion-live-add"
                                icon="plus-circle"
                                size="sm"
                                ariaLabel="Добавить номер"
                                tooltip="Добавить номер"
                                (clicked)="added.set(added() + 1)" />
                        </span>
                        <p rtExpansionPanelBody class="app-expansion-panel-live__text">Сорок два номера на четырёх этажах.</p>
                    </rt-expansion-panel>
                    <span class="app-expansion-panel-live__note">
                        Панель {{ actionsOpen() ? 'раскрыта' : 'свёрнута' }} · на сайте: {{ published() ? 'да' : 'нет' }} · добавлено:
                        {{ added() }}
                    </span>
                </div>
            }
            @case ('group') {
                <div class="app-expansion-panel-live app-expansion-panel-live--row">
                    <div class="app-expansion-panel-live__column">
                        <span class="app-expansion-panel-live__caption">Открыта одна</span>
                        <div rtExpansionPanelGroup class="app-expansion-panel-live__stack">
                            @for (item of items; track item.id; let first = $first) {
                                <rt-expansion-panel [expanded]="first">
                                    <span class="app-expansion-panel-live__title">{{ item.title }}</span>
                                    <p rtExpansionPanelBody class="app-expansion-panel-live__text">{{ item.text }}</p>
                                </rt-expansion-panel>
                            }
                        </div>
                    </div>
                    <div class="app-expansion-panel-live__column">
                        <span class="app-expansion-panel-live__caption">multi — независимо</span>
                        <div rtExpansionPanelGroup multi class="app-expansion-panel-live__stack">
                            @for (item of items; track item.id; let first = $first) {
                                <rt-expansion-panel [expanded]="first">
                                    <span class="app-expansion-panel-live__title">{{ item.title }}</span>
                                    <p rtExpansionPanelBody class="app-expansion-panel-live__text">{{ item.text }}</p>
                                </rt-expansion-panel>
                            }
                        </div>
                    </div>
                </div>
            }
            @case ('preserve') {
                <div class="app-expansion-panel-live app-expansion-panel-live--row">
                    <div class="app-expansion-panel-live__column">
                        <span class="app-expansion-panel-live__caption">preserveContent — текст остаётся</span>
                        <rt-expansion-panel preserveContent [expanded]="true">
                            <span class="app-expansion-panel-live__title">Фильтр</span>
                            <ng-template rtExpansionPanelContent>
                                <rt-input qa-dataid="expansion-live-kept" placeholder="Город" ariaLabel="Город" />
                            </ng-template>
                        </rt-expansion-panel>
                    </div>
                    <div class="app-expansion-panel-live__column">
                        <span class="app-expansion-panel-live__caption">по умолчанию — тело уходит</span>
                        <rt-expansion-panel [expanded]="true">
                            <span class="app-expansion-panel-live__title">Фильтр</span>
                            <ng-template rtExpansionPanelContent>
                                <rt-input qa-dataid="expansion-live-lost" placeholder="Город" ariaLabel="Город" />
                            </ng-template>
                        </rt-expansion-panel>
                    </div>
                </div>
            }
        }
    `,
    // native-ok: раскладка показа витрины, в пакет не уезжает
    styles: `
        .app-expansion-panel-live {
            display: flex;
            flex-direction: column;
            gap: var(--rt-space-sm);
            inline-size: 26rem;
        }

        .app-expansion-panel-live--row {
            flex-direction: row;
            align-items: flex-start;
            gap: var(--rt-space-lg);
            inline-size: 40rem;
        }

        .app-expansion-panel-live__column {
            display: flex;
            min-width: 0;
            flex: 1 1 0;
            flex-direction: column;
            gap: var(--rt-space-sm);
        }

        .app-expansion-panel-live__stack {
            display: flex;
            flex-direction: column;
            gap: var(--rt-space-sm);
        }

        .app-expansion-panel-live__title {
            overflow: hidden;
            min-width: 0;
            flex: 1 1 auto;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .app-expansion-panel-live__actions {
            display: inline-flex;
            align-items: center;
            gap: var(--rt-space-sm);
        }

        .app-expansion-panel-live__text {
            margin: 0;
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-sm);
        }

        .app-expansion-panel-live__caption,
        .app-expansion-panel-live__note {
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCheckboxComponent,
        RtExpansionPanelComponent,
        RtIconButtonComponent,
        RtInputComponent,

        // directives
        RtExpansionPanelActionsDirective,
        RtExpansionPanelContentDirective,
        RtExpansionPanelGroupDirective,
    ],
})
export class TestRtExpansionPanelLiveComponent {
    public readonly kind: InputSignal<TExpansionPanelLiveKind> = input<TExpansionPanelLiveKind>('actions');

    public readonly items: readonly IGroupItem[] = GROUP_ITEMS;

    public readonly actionsOpen: WritableSignal<boolean> = signal(false);
    public readonly published: WritableSignal<boolean> = signal(true);
    public readonly added: WritableSignal<number> = signal(0);
}

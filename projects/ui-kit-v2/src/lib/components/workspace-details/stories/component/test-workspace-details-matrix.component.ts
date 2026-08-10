import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtWorkspaceDetailsComponent } from '../../rt-workspace-details.component';
import { IRtWorkspaceDetails } from '../../rt-workspace-details.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type WorkspaceDetailsMatrixPart = 'blocks' | 'tabs' | 'loading' | 'actions' | 'audit' | 'themes';

const ROWS: readonly IRtWorkspaceDetails.Row[] = [
    { label: 'Номер', value: '2024-118' },
    { label: 'Город', value: 'Москва' },
    { label: 'Исполнитель', value: 'Иванов И. И.', agent: true },
];

const MONEY: readonly IRtWorkspaceDetails.MoneyRow[] = [
    { label: 'Работы', amount: 120000 },
    { label: 'Материалы', amount: 28000 },
    { label: 'Итого', amount: 148000, total: true },
];

const TOGGLES: readonly IRtWorkspaceDetails.Toggle[] = [
    { id: 'notify', label: 'Уведомлять о правках', value: true },
    { id: 'archive', label: 'В архиве', value: false, disabled: true },
];

const ACTIONS: readonly IRtWorkspaceDetails.Action[] = [
    { id: 'save', label: 'Сохранить', icon: 'check' },
    { id: 'send', label: 'Отправить', icon: 'arrow-right', appearance: 'outlined', loading: true },
    {
        id: 'delete',
        label: 'Удалить',
        icon: 'ico-trash',
        theme: 'danger',
        confirm: { title: 'Удалить договор?', label: 'Удалить', tone: 'danger', text: 'Действие необратимо.' },
    },
];

const AUDIT: IRtWorkspaceDetails.Audit = {
    steps: [
        { label: 'Договор создан', meta: '12 марта, 09:14', actor: 'Иванов И. И.', status: 'complete' },
        { label: 'Отправлен на согласование', meta: '13 марта, 11:20', actor: 'Петрова А. С.', status: 'complete' },
        { label: 'Ожидает подписи', meta: '14 марта, 16:02', status: 'current' },
    ],
    loading: false,
    loadingMore: false,
    hasMore: true,
    error: null,
    emptyText: 'Событий пока нет',
};

/**
 * Матрицы состояний `rt-workspace-details` для витрины.
 *
 * Входов у панели много, но осью значений ни один не служит: каждый включает свой блок, и вид
 * панели решает то, какие блоки заданы. Поэтому ряды сложены из наборов блоков.
 *
 * **Вкладки появляются только вместе с переходом или историей.** Пока есть одни поля, они
 * рисуются сразу: одна вкладка вместо содержимого была бы лишним щелчком — и это видно рядом.
 *
 * **Ошибка внутри панели не рисуется** — она уходит уведомлением поверх, потому что панель
 * узкая и сообщение в ней сдвигало бы данные. Ячейки под неё в матрице поэтому нет, и сказано
 * это в обзоре, а не оставлено пустым местом.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-workspace-details-matrix',
    template: `
        @switch (part) {
            @case ('blocks') {
                <app-story-row caption="Какие блоки заданы" slotWidth="20rem" [items]="blockCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-workspace-details
                            title="Договор №2024-118"
                            [entityId]="118"
                            [rows]="item.rows"
                            [money]="item.money"
                            [toggles]="item.toggles" />
                    </ng-template>
                </app-story-row>
            }

            @case ('tabs') {
                <app-story-row caption="Когда появляются вкладки" slotWidth="20rem" [items]="tabCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-workspace-details
                            title="Договор №2024-118"
                            [entityId]="118"
                            [rows]="rows"
                            [audit]="item.audit"
                            [transition]="item.transition" />
                    </ng-template>
                </app-story-row>
            }

            @case ('loading') {
                <app-story-row caption="Загрузка и занятость" slotWidth="20rem" [items]="loadingCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-workspace-details
                            title="Договор №2024-118"
                            [entityId]="118"
                            [rows]="rows"
                            [money]="money"
                            [loading]="item.loading"
                            [busy]="item.busy" />
                    </ng-template>
                </app-story-row>
            }

            @case ('actions') {
                <app-story-row caption="Кнопки действий" slotWidth="20rem" [items]="actionCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-workspace-details title="Договор №2024-118" [entityId]="118" [rows]="rows" [actions]="item.actions" />
                    </ng-template>
                </app-story-row>
            }

            @case ('audit') {
                <app-story-row caption="История событий" slotWidth="20rem" [items]="auditCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-workspace-details title="Договор №2024-118" [entityId]="118" [rows]="rows" [audit]="item.audit" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Панель в обеих темах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-workspace-details
                                title="Договор №2024-118"
                                [entityId]="118"
                                [rows]="rows"
                                [money]="money"
                                [toggles]="toggles"
                                [actions]="actions" />
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtWorkspaceDetailsComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtWorkspaceDetailsMatrixComponent {
    public part: WorkspaceDetailsMatrixPart = 'blocks';

    public readonly rows: readonly IRtWorkspaceDetails.Row[] = ROWS;
    public readonly money: readonly IRtWorkspaceDetails.MoneyRow[] = MONEY;
    public readonly toggles: readonly IRtWorkspaceDetails.Toggle[] = TOGGLES;
    public readonly actions: readonly IRtWorkspaceDetails.Action[] = ACTIONS;

    public readonly blockCases: readonly {
        name: string;
        rows: readonly IRtWorkspaceDetails.Row[];
        money: readonly IRtWorkspaceDetails.MoneyRow[];
        toggles: readonly IRtWorkspaceDetails.Toggle[];
    }[] = [
        { name: 'только поля', rows: ROWS, money: [], toggles: [] },
        { name: 'поля и суммы', rows: ROWS, money: MONEY, toggles: [] },
        { name: 'поля, суммы, переключатели', rows: ROWS, money: MONEY, toggles: TOGGLES },
        { name: 'ни одного блока', rows: [], money: [], toggles: [] },
    ];

    /** Вкладки появляются только вместе с переходом или историей. */
    public readonly tabCases: readonly {
        name: string;
        audit: IRtWorkspaceDetails.Audit | null;
        transition: IRtWorkspaceDetails.Transition | null;
    }[] = [
        { name: 'одни поля — вкладок нет', audit: null, transition: null },
        { name: 'с историей — вкладки есть', audit: AUDIT, transition: null },
        {
            name: 'с переходом — вкладки есть',
            audit: null,
            transition: {
                options: [{ label: 'На согласование', value: 'review' }],
                loading: false,
                error: null,
                submitError: null,
                submitting: false,
                success: null,
                currentStageLabel: 'Черновик',
                noTransitionsText: 'Переходов из этого состояния нет',
            },
        },
    ];

    public readonly loadingCases: readonly { name: string; loading: boolean; busy: boolean }[] = [
        { name: 'данные на месте', loading: false, busy: false },
        { name: 'loading — заглушки вместо значений', loading: true, busy: false },
        { name: 'busy — панель занята', loading: false, busy: true },
    ];

    public readonly actionCases: readonly { name: string; actions: readonly IRtWorkspaceDetails.Action[] }[] = [
        { name: 'без действий', actions: [] },
        { name: 'одно действие', actions: ACTIONS.slice(0, 1) },
        { name: 'три, одно в работе и одно с подтверждением', actions: ACTIONS },
    ];

    public readonly auditCases: readonly { name: string; audit: IRtWorkspaceDetails.Audit }[] = [
        { name: 'события есть', audit: AUDIT },
        { name: 'история грузится', audit: { ...AUDIT, steps: [], loading: true } },
        { name: 'догрузка снизу', audit: { ...AUDIT, loadingMore: true } },
        { name: 'событий нет', audit: { ...AUDIT, steps: [], hasMore: false } },
    ];

    public readonly caseLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;
}

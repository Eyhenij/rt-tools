import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal, untracked } from '@angular/core';
import { adminLabel, EReadFault, IReadFault } from '@rt/message-bus-admin/common/core/util';
import { ProposalStore } from '@rt/message-bus-admin/proposals/data-access';
import { AdminProposalViewComponent } from '@rt/message-bus-admin/proposals/ui';
import { IProposal } from '@rt/message-bus-admin/proposals/util';
import {
    RtAsideComponent,
    RtAsideFooterComponent,
    RtAsideHeaderComponent,
    RtButtonDirective,
    RtContainerRightSidenavPanelDirective,
    RtEmptyStateComponent,
    RtRouteAsideComponent,
} from '@rt-tools/ui-kit-v2';
import { Observable, of } from 'rxjs';

const BEM_BLOCK: string = 'admin-proposal-details-aside';

/**
 * Панель подробностей предложения: запись целиком, открытая нажатием на строку списка.
 *
 * Живёт маршрутом в аутлете `ro` и наследует основу панели из кита — открытие, закрытие, уход с
 * адреса и возврат к списку держит она. Выборка списка при этом остаётся в адресе нетронутой:
 * закрытая панель возвращает ту же страницу с тем же отбором и порядком.
 *
 * Запись панель читает сама, а не разрешателем основы: разрешатель читает отсутствие записи как
 * повод уйти с адреса, а договорённость требует сказать человеку, что записи нет, — ссылка
 * переживает её исчезновение, и пустая панель читалась бы поломкой чтения. Поэтому `idOnly`:
 * основа отдаёт признак записи из адреса и не читает ничего.
 */
@Component({
    selector: 'admin-proposal-details-aside',
    templateUrl: './admin-proposal-details-aside.component.html',
    styleUrl: './admin-proposal-details-aside.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        AdminProposalViewComponent,
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtButtonDirective,
        RtContainerRightSidenavPanelDirective,
        RtEmptyStateComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminProposalDetailsAsideComponent extends RtRouteAsideComponent<IProposal.State> {
    readonly #store: ProposalStore = inject(ProposalStore);

    protected readonly title: string = adminLabel('detailsProposal');
    protected readonly closeLabel: string = adminLabel('detailsClose');

    /** Основа записи не читает: чтение ведёт сам раздел — ему нужно сказать и про её отсутствие. */
    protected override readonly idOnly: boolean = true;

    protected readonly record: Signal<IProposal.State | null> = this.#store.entity;
    protected readonly reading: Signal<boolean> = this.#store.pending;

    /** Что сказать вместо записи. Пусто — говорить нечего: запись читается или прочитана. */
    protected readonly missingText: Signal<string> = computed(() => {
        const fault: IReadFault | null = this.#store.fault();

        if (fault === null) {
            return '';
        }

        return adminLabel(fault.kind === EReadFault.Missing ? 'detailsMissing' : 'detailsFailed');
    });

    /** Ресурс надстрочником: заголовок называет род записи, а надстрочник — само правимое место. */
    protected readonly overline: Signal<string> = computed(() => this.record()?.resource ?? '');

    constructor() {
        super();

        effect((): void => {
            const id: string | null = this.entityId();

            if (id !== null) {
                untracked((): void => this.#store.read(id));
            }
        });
    }

    /** Основа при `idOnly` не зовёт разрешателя вовсе; объявлен он потому, что она его требует. */
    protected resolve(): Observable<IProposal.State | null> {
        return of(null);
    }
}

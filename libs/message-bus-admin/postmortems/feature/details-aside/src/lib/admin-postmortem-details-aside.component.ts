import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal, untracked } from '@angular/core';
import { adminLabel, EReadFault, IReadFault } from '@rt/message-bus-admin/common/core/util';
import { PostmortemStore } from '@rt/message-bus-admin/postmortems/data-access';
import { AdminPostmortemViewComponent } from '@rt/message-bus-admin/postmortems/ui';
import { IPostmortem } from '@rt/message-bus-admin/postmortems/util';
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

const BEM_BLOCK: string = 'admin-postmortem-details-aside';

/**
 * Панель подробностей разбора: запись целиком, открытая нажатием на строку списка.
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
    selector: 'admin-postmortem-details-aside',
    templateUrl: './admin-postmortem-details-aside.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        AdminPostmortemViewComponent,
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtButtonDirective,
        RtContainerRightSidenavPanelDirective,
        RtEmptyStateComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminPostmortemDetailsAsideComponent extends RtRouteAsideComponent<IPostmortem.State> {
    readonly #store: PostmortemStore = inject(PostmortemStore);

    protected readonly title: string = adminLabel('detailsPostmortem');
    protected readonly closeLabel: string = adminLabel('detailsClose');

    /** Основа записи не читает: чтение ведёт сам раздел — ему нужно сказать и про её отсутствие. */
    protected override readonly idOnly: boolean = true;

    protected readonly record: Signal<IPostmortem.State | null> = this.#store.entity;
    protected readonly reading: Signal<boolean> = this.#store.pending;

    /** Что сказать вместо записи. Пусто — говорить нечего: запись читается или прочитана. */
    protected readonly missingText: Signal<string> = computed(() => {
        const fault: IReadFault | null = this.#store.fault();

        if (fault === null) {
            return '';
        }

        return adminLabel(fault.kind === EReadFault.Missing ? 'detailsMissing' : 'detailsFailed');
    });

    /** Имя файла надстрочником: заголовок называет род записи, а надстрочник — саму запись. */
    protected readonly overline: Signal<string> = computed(() => this.record()?.file ?? '');

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
    protected resolve(): Observable<IPostmortem.State | null> {
        return of(null);
    }
}

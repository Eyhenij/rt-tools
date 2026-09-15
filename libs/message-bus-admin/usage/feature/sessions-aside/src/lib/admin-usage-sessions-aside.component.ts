import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Params } from '@angular/router';
import { adminLabel, IAdminListQuery, IReadFault, listQueryOf } from '@rt/message-bus-admin/common/core/util';
import { UsageSessionsStore } from '@rt/message-bus-admin/usage/data-access';
import { AdminUsageSessionsViewComponent } from '@rt/message-bus-admin/usage/ui';
import { IUsage } from '@rt/message-bus-admin/usage/util';
import { USAGE_SORTABLE } from '@rt/message-bus-common';
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

const BEM_BLOCK: string = 'admin-usage-sessions-aside';

/**
 * Панель сессий одного скила: день, признак сессии и сколько раз, открытая нажатием на строку.
 *
 * Живёт маршрутом в аутлете `ro` и наследует основу панели из кита — открытие, закрытие, уход с
 * адреса и возврат к списку держит она. Скил берётся из сегмента адреса, дерево и период — из
 * той же выборки, какой читана таблица: они лежат в том же адресе, и панель показывает сессии
 * ровно за то, что показано в таблице.
 *
 * Сессии панель читает сама, а не разрешателем основы: разрешатель читает пустой ответ как повод
 * уйти с адреса, а скил без сессий за период — законный ответ. Поэтому `idOnly`: основа отдаёт
 * скил из адреса и не читает ничего.
 */
@Component({
    selector: 'admin-usage-sessions-aside',
    templateUrl: './admin-usage-sessions-aside.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        AdminUsageSessionsViewComponent,
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtButtonDirective,
        RtContainerRightSidenavPanelDirective,
        RtEmptyStateComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminUsageSessionsAsideComponent extends RtRouteAsideComponent<readonly IUsage.Session.State[]> {
    readonly #store: UsageSessionsStore = inject(UsageSessionsStore);
    readonly #params: Signal<Params> = toSignal(this.route.queryParams, { initialValue: this.route.snapshot.queryParams });

    protected readonly title: string = adminLabel('detailsUsageSessions');
    protected readonly closeLabel: string = adminLabel('detailsClose');

    /** Сегмент адреса с признаком записи — здесь это имя скила. */
    protected override readonly idParamName: string = 'skill';

    /** Основа сессий не читает: чтение ведёт сам раздел — пустой список ему законный ответ. */
    protected override readonly idOnly: boolean = true;

    protected readonly rows: Signal<readonly IUsage.Session.State[]> = this.#store.rows;
    protected readonly reading: Signal<boolean> = this.#store.pending;

    /** Что сказать вместо сессий. Пусто — говорить нечего: сессии читаются или прочитаны. */
    protected readonly failedText: Signal<string> = computed(() => {
        const fault: IReadFault | null = this.#store.fault();

        return fault === null ? '' : adminLabel('detailsSessionsFailed');
    });

    /** Скил надстрочником: заголовок называет род панели, а надстрочник — чьи сессии. */
    protected readonly overline: Signal<string> = computed(() => this.entityId() ?? '');

    constructor() {
        super();

        effect((): void => {
            const skill: string | null = this.entityId();
            const params: Params = this.#params();

            if (skill !== null) {
                untracked((): void => this.#read(skill, params));
            }
        });
    }

    /** Основа при `idOnly` не зовёт разрешателя вовсе; объявлен он потому, что она его требует. */
    protected resolve(): Observable<readonly IUsage.Session.State[] | null> {
        return of(null);
    }

    /** Дерево и период — той же выборкой, какой их читает таблица: один разбор адреса на двоих. */
    #read(skill: string, params: Params): void {
        const asked: IAdminListQuery = listQueryOf(params, USAGE_SORTABLE);

        this.#store.read({ skill, tree: asked.tree, from: asked.from, to: asked.to });
    }
}

import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FormControl, FormGroup, FormRecord, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesStore } from '@rt/message-bus-admin/accounts/data-access';
import { IRightGroup, IRole, rightGroups } from '@rt/message-bus-admin/accounts/util';
import { AdminTextService, spokenFaultText, TAdminLabelKey } from '@rt/message-bus-admin/common/core/util';
import { RIGHTS, TRight } from '@rt/message-bus-common';
import {
    RtAsideComponent,
    RtAsideFooterComponent,
    RtAsideHeaderComponent,
    RtAsideSectionComponent,
    RtButtonDirective,
    RtCheckboxComponent,
    RtContainerRightSidenavPanelDirective,
    RtFieldComponent,
    RtInputComponent,
    RtMessageComponent,
    RtRouteAsideComponent,
    TRtKitLabelParams,
} from '@rt-tools/ui-kit-v2';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { Observable } from 'rxjs';

const BEM_BLOCK: string = 'admin-role-aside';

/**
 * Панель роли: имя и по чекбоксу на каждое право набора, сгруппированные по разделам.
 *
 * Живёт двумя маршрутами в аутлете `ro`: «roles/new» заводит роль — признака записи в адресе
 * нет, и основа панели ставит режим заведения сама; «roles/<ключ>» правит существующую — роль
 * читается по ключу из адреса, а не берётся из списка.
 *
 * Права стоят чекбоксами по разделам, а не плоским списком пар: человек собирает роль по тому,
 * что она открывает. Набор прав берётся из закрытого набора общей либы: право, появившееся в
 * наборе, встаёт в панель само.
 *
 * Отказ оставляет человека в панели с его вводом, и слово приёмника показывается как есть:
 * занятое имя и самозапирание — про его же действие.
 */
@Component({
    selector: 'admin-role-aside',
    templateUrl: './admin-role-aside.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // directives
        BlockDirective,
        ElemDirective,

        // components
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtAsideSectionComponent,
        RtButtonDirective,
        RtCheckboxComponent,
        RtContainerRightSidenavPanelDirective,
        RtFieldComponent,
        RtInputComponent,
        RtMessageComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminRoleAsideComponent extends RtRouteAsideComponent<IRole.Short.State> {
    readonly #text: AdminTextService = inject(AdminTextService);

    readonly #store: RolesStore = inject(RolesStore);

    protected readonly nameLabel: Signal<string> = computed((): string => this.#text.text('roleName'));
    protected readonly nameHint: Signal<string> = computed((): string => this.#text.text('roleNameHint'));
    protected readonly closeLabel: Signal<string> = computed((): string => this.#text.text('panelClose'));
    /** Права по разделам: подписи собираются из словаря на каждой отрисовке. */
    protected readonly groups: Signal<readonly IRightGroup[]> = computed((): readonly IRightGroup[] =>
        rightGroups((key: TAdminLabelKey, params?: TRtKitLabelParams): string => this.#text.text(key, params))
    );

    /** Заголовок и слово кнопки — по режиму: заведение и правка говорят разными словами. */
    protected readonly title: Signal<string> = computed((): string =>
        this.isCreateMode() ? this.#text.text('roleCreateTitle') : this.#text.text('roleEditTitle')
    );
    protected readonly submitLabel: Signal<string> = computed((): string =>
        this.isCreateMode() ? this.#text.text('roleCreateSubmit') : this.#text.text('roleSaveSubmit')
    );

    protected readonly name: FormControl<string> = new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
    });

    /** По полю на право набора, ключ — имя права. Без права в наборе поля нет, и наоборот. */
    protected readonly rights: FormRecord<FormControl<boolean>> = new FormRecord<FormControl<boolean>>(
        Object.fromEntries(
            RIGHTS.map((right: TRight): [TRight, FormControl<boolean>] => [right, new FormControl<boolean>(false, { nonNullable: true })])
        )
    );

    protected readonly form: FormGroup = new FormGroup({ name: this.name, rights: this.rights });

    constructor() {
        super();
        // Тронутая форма спрашивает о правках на всех четырёх путях закрытия, и «закрыть с
        // сохранением» зовёт ту же запись, что и кнопка
        this.guardUnsavedChanges({ pristine: this.pristineSignal(this.form), save: (): void => this.submit() });
    }

    /** Завести или сохранить. Занятость и текст отказа держит основа; после удачи панель закрывается. */
    protected submit(): void {
        if (this.name.invalid) {
            this.name.markAsTouched();

            return;
        }

        const name: string = this.name.getRawValue().trim();
        const rights: TRight[] = RIGHTS.filter((right: TRight): boolean => this.rights.controls[right]?.value === true);
        const key: string | null = this.entityId();
        const creating: boolean = key === null;
        const saved: Observable<IRole.Short.State> =
            key === null ? this.#store.create({ name, rights }) : this.#store.replace(key, { name, rights });

        this.runMutation(saved, {
            successText: this.#text.text(creating ? 'roleCreateDone' : 'roleSaveDone', { name }),
            errorText: (error: unknown): string =>
                spokenFaultText(error, this.#text.text(creating ? 'roleCreateFailed' : 'roleSaveFailed')),
            closeOnSuccess: true,
        });
    }

    /** Роль по ключу из адреса — для правки. Заведение основу сюда не ведёт. */
    protected resolve(key: string): Observable<IRole.Short.State | null> {
        return this.#store.one(key);
    }

    /** Прочитанная роль встаёт в форму: имя и отметки прав. Форма после этого чистая. */
    protected override onResolved(): void {
        const role: IRole.Short.State | null = this.entity();

        if (role === null) {
            return;
        }

        this.name.setValue(role.name);
        RIGHTS.forEach((right: TRight): void => this.rights.controls[right]?.setValue(role.rights.includes(right)));
        this.form.markAsPristine();
    }
}

import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { PeopleStore, RolesStore } from '@rt/message-bus-admin/accounts/data-access';
import {
    accessOutcome,
    EAccessWord,
    editsOfWords,
    IPersonAccess,
    IRightGroup,
    IRole,
    rightGroups,
} from '@rt/message-bus-admin/accounts/util';
import { adminLabel, spokenFaultText } from '@rt/message-bus-admin/common/core/util';
import { RIGHTS, TRight } from '@rt/message-bus-common';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import {
    IRtSelect,
    RtAsideComponent,
    RtAsideFooterComponent,
    RtAsideHeaderComponent,
    RtAsideSectionComponent,
    RtButtonDirective,
    RtContainerRightSidenavPanelDirective,
    RtFieldComponent,
    RtMessageComponent,
    RtRouteAsideComponent,
    RtSelectComponent,
} from '@rt-tools/ui-kit-v2';
import { forkJoin, map, Observable } from 'rxjs';

const BEM_BLOCK: string = 'admin-person-access-aside';

/**
 * Значение выбора «без роли». Пустая строка, а не `null`: выбор набора читает `null` как «ничего не
 * выбрано» и показывает вместо подписи пустоту, а человек без роли должен прочитать это словами.
 */
const NO_ROLE: string = '';

/** Что панель читает по адресу: доступ записи и все роли для выбора. */
interface IAccessPanel {
    readonly access: IPersonAccess.State;
    readonly roles: readonly IRole.Short.State[];
}

/**
 * Панель прав человека: роль и одно из трёх слов на каждое право набора, с исходом рядом.
 *
 * Живёт маршрутом «people/<имя>/access» в аутлете `ro`, рядом со списком людей. Читает по имени
 * из адреса доступ записи и заодно все роли — выбирать роль иначе не из чего.
 *
 * Слово на право — «по роли», «дано», «отнято»: чекбокс не сказал бы «отнято поверх роли».
 * Рядом с каждым правом стоит исход — есть право или нет, — и считается он тем же сложением, что
 * у приёмника, до сохранения: право, о котором роль молчит, читается словом «нет» на самой
 * странице, а не выводится читающим.
 *
 * Сохранение заменяет доступ целиком, и после удачи панель закрывается: строка списка людей несёт
 * новую роль сама. Отказ — самозапирание, роли нет — остаётся в панели словом приёмника.
 */
@Component({
    selector: 'admin-person-access-aside',
    templateUrl: './admin-person-access-aside.component.html',
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
        RtContainerRightSidenavPanelDirective,
        RtFieldComponent,
        RtMessageComponent,
        RtSelectComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminPersonAccessAsideComponent extends RtRouteAsideComponent<IAccessPanel> {
    readonly #people: PeopleStore = inject(PeopleStore);
    readonly #roles: RolesStore = inject(RolesStore);

    protected readonly roleLabel: string = adminLabel('personAccessRole');
    protected readonly roleHint: string = adminLabel('personAccessRoleHint');
    protected readonly submitLabel: string = adminLabel('personAccessSubmit');
    protected readonly closeLabel: string = adminLabel('panelClose');
    protected readonly groups: readonly IRightGroup[] = rightGroups();

    /** Три слова о праве — одни на все права. */
    protected readonly words: readonly IRtSelect.Option<EAccessWord>[] = [
        { label: adminLabel('personAccessByRole'), value: EAccessWord.ByRole },
        { label: adminLabel('personAccessGranted'), value: EAccessWord.Granted },
        { label: adminLabel('personAccessRevoked'), value: EAccessWord.Revoked },
    ];

    /** Заголовок называет человека. Пусто, пока адрес не прочитан. */
    protected readonly title: Signal<string> = computed((): string => {
        const name: string | null = this.entityId();

        return name === null ? '' : adminLabel('personAccessTitle', { name });
    });

    /** Роли для выбора: «без роли» и все роли приёмника по имени. */
    protected readonly roleOptions: Signal<readonly IRtSelect.Option<string>[]> = computed((): readonly IRtSelect.Option<string>[] => [
        { label: adminLabel('personAccessRoleNone'), value: NO_ROLE },
        ...(this.entity()?.roles ?? []).map((role: IRole.Short.State): IRtSelect.Option<string> => ({
            label: role.name,
            value: role.key,
        })),
    ]);

    protected readonly role: FormControl<string> = new FormControl<string>(NO_ROLE, { nonNullable: true });

    /** По полю на право набора, ключ — имя права. */
    protected readonly rightWords: FormRecord<FormControl<EAccessWord>> = new FormRecord<FormControl<EAccessWord>>(
        Object.fromEntries(
            RIGHTS.map((right: TRight): [TRight, FormControl<EAccessWord>] => [
                right,
                new FormControl<EAccessWord>(EAccessWord.ByRole, { nonNullable: true }),
            ])
        )
    );

    protected readonly form: FormGroup = new FormGroup({ role: this.role, rights: this.rightWords });

    /** Значения формы сигналом: исход пересчитывается на каждом выборе, до сохранения. */
    readonly #formValue: Signal<unknown> = toSignal(this.form.valueChanges, { initialValue: null });

    /**
     * Исход по каждому праву словом: «есть» или «нет». Считается сложением общей либы от прав
     * выбранной роли и слов формы — тем же, каким приёмник сложит их после сохранения.
     */
    protected readonly outcome: Signal<Readonly<Record<TRight, string>>> = computed((): Readonly<Record<TRight, string>> => {
        this.#formValue();

        const chosen: IRole.Short.State | undefined = (this.entity()?.roles ?? []).find(
            (role: IRole.Short.State): boolean => role.key === this.role.value
        );
        const given: ReadonlySet<TRight> = accessOutcome(chosen?.rights ?? null, this.#wordsNow());
        const labels: Partial<Record<TRight, string>> = {};

        RIGHTS.forEach((right: TRight): void => {
            labels[right] = given.has(right) ? adminLabel('personAccessHas') : adminLabel('personAccessHasNot');
        });

        return labels as Readonly<Record<TRight, string>>;
    });

    constructor() {
        super();
        this.guardUnsavedChanges({ pristine: this.pristineSignal(this.form), save: (): void => this.submit() });
    }

    /** Сохранить доступ целиком. Занятость и текст отказа держит основа; после удачи панель закрывается. */
    protected submit(): void {
        const name: string | null = this.entityId();

        if (name === null) {
            return;
        }

        const role: string | null = this.role.value === NO_ROLE ? null : this.role.value;

        this.runMutation(this.#people.replaceAccess(name, { role, edits: editsOfWords(this.#wordsNow()) }), {
            successText: adminLabel('personAccessDone', { name }),
            errorText: (error: unknown): string => spokenFaultText(error, adminLabel('personAccessFailed')),
            closeOnSuccess: true,
        });
    }

    /** Доступ записи и все роли — одним чтением: без ролей выбирать не из чего. */
    protected resolve(name: string): Observable<IAccessPanel | null> {
        return forkJoin({ access: this.#people.access(name), roles: this.#roles.all() }).pipe(
            map((panel: { access: IPersonAccess.State; roles: readonly IRole.Short.State[] }): IAccessPanel => panel)
        );
    }

    /** Прочитанный доступ встаёт в форму: роль и слово на каждое право. Форма после этого чистая. */
    protected override onResolved(): void {
        const panel: IAccessPanel | null = this.entity();

        if (panel === null) {
            return;
        }

        this.role.setValue(panel.access.role ?? NO_ROLE);
        RIGHTS.forEach((right: TRight): void => this.rightWords.controls[right]?.setValue(panel.access.words[right]));
        this.form.markAsPristine();
    }

    /** Слова формы записью по праву: то, что уйдёт приёмнику и из чего считается исход. */
    #wordsNow(): Readonly<Record<TRight, EAccessWord>> {
        const words: Partial<Record<TRight, EAccessWord>> = {};

        RIGHTS.forEach((right: TRight): void => {
            words[right] = this.rightWords.controls[right]?.value ?? EAccessWord.ByRole;
        });

        return words as Readonly<Record<TRight, EAccessWord>>;
    }
}

import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PeopleStore } from '@rt/message-bus-admin/accounts/data-access';
import { adminFaultText, AdminTextService, IAdminFaultText } from '@rt/message-bus-admin/common/core/util';
import {
    RtAsideComponent,
    RtAsideFooterComponent,
    RtAsideHeaderComponent,
    RtButtonDirective,
    RtContainerRightSidenavPanelDirective,
    RtFieldComponent,
    RtInputComponent,
    RtMessageComponent,
    RtRouteAsideComponent,
} from '@rt-tools/ui-kit-v2';
import { Observable, of } from 'rxjs';

const BEM_BLOCK: string = 'admin-person-password-aside';

/**
 * Панель нового пароля: одно поле для записи, названной адресом.
 *
 * Живёт маршрутом `people/<имя>/password` в аутлете `ro`, рядом со списком, и наследует основу
 * панели из кита: занятость записи, отказ и закрытие держит она. Имя приезжает признаком записи
 * из адреса, и читать по нему нечего — всё, что о человеке известно, стоит в строке списка, а
 * панели нужно одно имя. Поэтому `idOnly`.
 *
 * Прежние входы записи новый пароль не обрывает: его сменил тот, кто заведует записями, а
 * человек посреди работы от этого не вылетает. Панель говорит об этом подсказкой под полем.
 *
 * После удачи панель закрывается: показывать в ней нечего — приёмник держит хеш, и пароль
 * передаёт человеку сам сменивший.
 */
@Component({
    selector: 'admin-person-password-aside',
    templateUrl: './admin-person-password-aside.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtAsideComponent,
        RtAsideFooterComponent,
        RtAsideHeaderComponent,
        RtButtonDirective,
        RtContainerRightSidenavPanelDirective,
        RtFieldComponent,
        RtInputComponent,
        RtMessageComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminPersonPasswordAsideComponent extends RtRouteAsideComponent<null> {
    readonly #text: AdminTextService = inject(AdminTextService);

    readonly #store: PeopleStore = inject(PeopleStore);

    /** Текст отказа: причину называет приёмник кодом, слово рисует словарь на выбранном языке. */
    protected readonly fault: IAdminFaultText = adminFaultText('personPasswordFailed');

    protected readonly title: Signal<string> = computed((): string => this.#text.text('personPasswordTitle'));
    protected readonly passwordLabel: Signal<string> = computed((): string => this.#text.text('personPasswordField'));
    protected readonly passwordHint: Signal<string> = computed((): string => this.#text.text('personPasswordHint'));
    protected readonly submitLabel: Signal<string> = computed((): string => this.#text.text('personPasswordSubmit'));
    protected readonly closeLabel: Signal<string> = computed((): string => this.#text.text('panelClose'));

    /** Панель ничего не читает по адресу: ей нужно одно имя, и оно уже в адресе. */
    protected override readonly idOnly: boolean = true;

    /** Кому пароль — словами под заголовком. Пусто, пока адрес не прочитан. */
    protected readonly forWhom: Signal<string> = computed((): string => {
        const name: string | null = this.entityId();

        return name === null ? '' : this.#text.text('personPasswordFor', { name });
    });

    protected readonly password: FormControl<string> = new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
    });

    /** Сменить пароль. Занятость и текст отказа держит основа; после удачи панель закрывается. */
    protected submit(): void {
        const name: string | null = this.entityId();

        if (this.password.invalid || name === null) {
            this.password.markAsTouched();

            return;
        }

        this.runMutation(this.#store.replacePassword(name, this.password.getRawValue()), {
            successText: this.#text.text('personPasswordDone', { name }),
            errorText: this.fault.take,
            closeOnSuccess: true,
        });
    }

    /** Основа при `idOnly` разрешателя не зовёт; объявлен он потому, что она его требует. */
    protected resolve(): Observable<null> {
        return of(null);
    }
}

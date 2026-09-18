import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PeopleStore } from '@rt/message-bus-admin/accounts/data-access';
import { AdminTextService, spokenFaultText } from '@rt/message-bus-admin/common/core/util';
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

const BEM_BLOCK: string = 'admin-person-create-aside';

/**
 * Панель заведения пользователя: имя и первый пароль на входе, строка в списке на выходе.
 *
 * Живёт маршрутом в аутлете `ro`, рядом со списком, и наследует основу панели из кита: занятость
 * записи, отказ и закрытие держит она. Записи, которую панель открывает, ещё нет, поэтому
 * `idOnly`: читать по адресу нечего, и на месте признака записи стоит слово `new`.
 *
 * Пароль называет заводящий и передаёт человеку сам, мимо приёмника: у приёмника нет ни почты,
 * ни второго места показа. Поэтому после удачи панель закрывается сразу — показывать в ней
 * нечего, а список уже несёт новую строку.
 *
 * Отказ оставляет человека в панели с его вводом, и слово приёмника показывается как есть:
 * занятое имя и пустой пароль — про его же действие. Поломка службы своего слова не несёт, и на
 * неё отвечает общая строка раздела.
 */
@Component({
    selector: 'admin-person-create-aside',
    templateUrl: './admin-person-create-aside.component.html',
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
export class AdminPersonCreateAsideComponent extends RtRouteAsideComponent<null> {
    readonly #text: AdminTextService = inject(AdminTextService);

    readonly #store: PeopleStore = inject(PeopleStore);

    protected readonly title: Signal<string> = computed((): string => this.#text.text('personCreateTitle'));
    protected readonly nameLabel: Signal<string> = computed((): string => this.#text.text('personCreateName'));
    protected readonly nameHint: Signal<string> = computed((): string => this.#text.text('personCreateNameHint'));
    protected readonly passwordLabel: Signal<string> = computed((): string => this.#text.text('personCreatePassword'));
    protected readonly passwordHint: Signal<string> = computed((): string => this.#text.text('personCreatePasswordHint'));
    protected readonly submitLabel: Signal<string> = computed((): string => this.#text.text('personCreateSubmit'));
    protected readonly closeLabel: Signal<string> = computed((): string => this.#text.text('panelClose'));

    /** Панель ничего не читает по адресу: записи, которую она заводит, ещё нет. */
    protected override readonly idOnly: boolean = true;

    protected readonly name: FormControl<string> = new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
    });

    protected readonly password: FormControl<string> = new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
    });

    /** Завести запись. Занятость и текст отказа держит основа; после удачи панель закрывается. */
    protected submit(): void {
        if (this.name.invalid || this.password.invalid) {
            this.name.markAsTouched();
            this.password.markAsTouched();

            return;
        }

        const name: string = this.name.getRawValue().trim();

        this.runMutation(this.#store.create(name, this.password.getRawValue()), {
            successText: this.#text.text('personCreateDone', { name }),
            errorText: (error: unknown): string => spokenFaultText(error, this.#text.text('personCreateFailed')),
            closeOnSuccess: true,
        });
    }

    /** Основа при `idOnly` разрешателя не зовёт; объявлен он потому, что она его требует. */
    protected resolve(): Observable<null> {
        return of(null);
    }
}

import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminTextService, spokenFaultText } from '@rt/message-bus-admin/common/core/util';
import { InvitesStore } from '@rt/message-bus-admin/invites/data-access';
import { IInvite } from '@rt/message-bus-admin/invites/util';
import {
    RtAsideComponent,
    RtAsideFooterComponent,
    RtAsideHeaderComponent,
    RtButtonDirective,
    RtContainerRightSidenavPanelDirective,
    RtCopyCellComponent,
    RtFieldComponent,
    RtInputComponent,
    RtMessageComponent,
    RtRouteAsideComponent,
} from '@rt-tools/ui-kit-v2';
import { Observable, of, tap } from 'rxjs';

const BEM_BLOCK: string = 'admin-invite-create-aside';

/**
 * Панель создания приглашения: имя будущего дерева на входе, код приглашения на выходе.
 *
 * Живёт маршрутом в аутлете `ro`, рядом со списком, и наследует основу панели из кита: занятость
 * записи, отказ и закрытие держит она. Записи, которую панель открывает, ещё нет, поэтому
 * `idOnly`: читать по адресу нечего, и на месте признака записи стоит слово `new`.
 *
 * Выданный код остаётся в панели до её закрытия и никуда больше не уходит: в хранилище лежит
 * только хеш, а список кода не показывает никогда. Поэтому панель не закрывается по удавшейся
 * выдаче — закрытая ответом, она унесла бы с собой единственный показ.
 *
 * Имя после выдачи запирается: приглашение уже выдано, и второе на то же имя приёмник отобьёт.
 * Нужно другое — панель закрывается и открывается заново.
 */
@Component({
    selector: 'admin-invite-create-aside',
    templateUrl: './admin-invite-create-aside.component.html',
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
        RtCopyCellComponent,
        RtFieldComponent,
        RtInputComponent,
        RtMessageComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminInviteCreateAsideComponent extends RtRouteAsideComponent<null> {
    readonly #text: AdminTextService = inject(AdminTextService);
    readonly #store: InvitesStore = inject(InvitesStore);

    readonly #issued: WritableSignal<IInvite.Issued.State | null> = signal<IInvite.Issued.State | null>(null);

    protected readonly title: Signal<string> = computed((): string => this.#text.text('inviteCreateTitle'));
    protected readonly nameLabel: Signal<string> = computed((): string => this.#text.text('inviteCreateName'));
    protected readonly nameHint: Signal<string> = computed((): string => this.#text.text('inviteCreateNameHint'));
    protected readonly submitLabel: Signal<string> = computed((): string => this.#text.text('inviteCreateSubmit'));
    protected readonly warnText: Signal<string> = computed((): string => this.#text.text('inviteCreateWarn'));
    protected readonly codeLabel: Signal<string> = computed((): string => this.#text.text('inviteCreateCode'));
    protected readonly closeLabel: Signal<string> = computed((): string => this.#text.text('inviteCreateClose'));

    /** Панель ничего не читает по адресу: записи, которую она заводит, ещё нет. */
    protected override readonly idOnly: boolean = true;

    protected readonly name: FormControl<string> = new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
    });

    /** Выданное приглашение. Пусто — выдачи ещё не было, и панель показывает поле имени. */
    protected readonly issued: Signal<IInvite.Issued.State | null> = this.#issued.asReadonly();

    /** До какого часа код годен. Пусто — говорить нечего: приглашение ещё не выдано. */
    protected readonly expiresText: Signal<string> = computed((): string => {
        const issued: IInvite.Issued.State | null = this.#issued();

        return issued === null ? '' : this.#text.text('inviteCreateExpires', { until: issued.expiresAt.toLocaleString('ru-RU') });
    });

    /** Выдать приглашение. Занятость и текст отказа держит основа, код кладёт сюда сам поток. */
    protected submit(): void {
        if (this.name.invalid) {
            this.name.markAsTouched();

            return;
        }

        const name: string = this.name.getRawValue().trim();

        this.runMutation(this.#store.issue(name).pipe(tap((issued: IInvite.Issued.State): void => this.#issued.set(issued))), {
            successText: this.#text.text('inviteCreateDone', { name }),
            // Слово приёмника показывается как есть: отклонённое обращение он объясняет
            // человеку сам — чем занято имя, чего не хватило. Поломка службы своего слова не
            // несёт, и на неё отвечает общая строка раздела
            errorText: (error: unknown): string => spokenFaultText(error, this.#text.text('inviteCreateFailed')),
            // Панель остаётся открытой: код виден один раз, и закрытие унесло бы его с
            // собой. Имя при этом запирается — приглашение на него уже выдано
            onSuccess: (): void => this.name.disable(),
        });
    }

    /** Основа при `idOnly` разрешателя не зовёт; объявлен он потому, что она его требует. */
    protected resolve(): Observable<null> {
        return of(null);
    }
}

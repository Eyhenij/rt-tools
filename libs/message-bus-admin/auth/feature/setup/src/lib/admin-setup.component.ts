import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { ISetupState, ISignInPair, SIGN_IN_PATH } from '@rt/message-bus-admin/auth/util';
import { AdminLocaleSwitchComponent } from '@rt/message-bus-admin/common/core/ui';
import { AdminTextService, spokenFaultText } from '@rt/message-bus-admin/common/core/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtButtonDirective, RtFieldComponent, RtInputComponent, RtMessageComponent, RtThemeToggleComponent } from '@rt-tools/ui-kit-v2';
import { catchError, exhaustMap, finalize, map, Observable, of, Subject } from 'rxjs';

/** Хост экрана — внешний узел готового блока входа, который везёт кит; своего блока у экрана нет. */
const BEM_BLOCK: string = 'login__viewport';

/** Куда вести заведённого: он вошёл тем же запросом, и первый раздел ему открыт. */
const HOME_PATH: string = '/';

/**
 * Экран первой записи.
 *
 * Открыт, пока в приёмнике нет ни одной записи, и закрыт навсегда с первой: узел без записи иначе
 * не имеет входа. Пришедшему на закрытый экран здесь делать нечего, и его уводят на вход — тем же
 * ответом приёмника, по которому вход уводит сюда.
 *
 * Форма стоит здесь, а не в слое `ui` рядом с формой входа: у той три рода отказа и подпись к
 * каждому, у этой одно слово — то, что сказал приёмник. Занятость и отказ экран держит сам, а
 * удачу кладёт стор: дальше это тот же вошедший, что и после входа по паре.
 */
@Component({
    selector: 'admin-setup',
    imports: [
        ReactiveFormsModule,
        AdminLocaleSwitchComponent,
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtFieldComponent,
        RtInputComponent,
        RtMessageComponent,
        RtThemeToggleComponent,
    ],
    templateUrl: './admin-setup.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class AdminSetupComponent {
    readonly #store: AuthStore = inject(AuthStore);
    readonly #router: Router = inject(Router);
    readonly #submitSource: Subject<ISignInPair> = new Subject<ISignInPair>();
    readonly #text: AdminTextService = inject(AdminTextService);

    // Язык переключают здесь же, над карточкой: подписи производные, иначе экран остался бы на
    // прежнем языке под тем самым переключателем, которым язык и сменили.
    protected readonly appTitle: Signal<string> = computed((): string => this.#text.text('appTitle'));
    protected readonly setupTitle: Signal<string> = computed((): string => this.#text.text('setupTitle'));
    protected readonly setupHint: Signal<string> = computed((): string => this.#text.text('setupHint'));
    protected readonly nameLabel: Signal<string> = computed((): string => this.#text.text('setupName'));
    protected readonly passwordLabel: Signal<string> = computed((): string => this.#text.text('setupPassword'));
    protected readonly submitLabel: Signal<string> = computed((): string => this.#text.text('setupSubmit'));

    protected readonly form: FormGroup<{ name: FormControl<string>; password: FormControl<string> }> = new FormGroup({
        name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    });

    /** Форма рисуется по ответу приёмника, что запись ждут: до него неизвестно, чей это экран. */
    protected readonly ready: WritableSignal<boolean> = signal<boolean>(false);
    protected readonly pending: WritableSignal<boolean> = signal<boolean>(false);
    protected readonly faultText: WritableSignal<string | null> = signal<string | null>(null);

    constructor() {
        this.#store
            .setupState()
            .pipe(takeUntilDestroyed())
            .subscribe({
                next: (state: ISetupState): void => this.#opened(state.open),
                // Приёмник не ответил: форма показывается, и отказ он скажет на самом заведении
                error: (): void => this.ready.set(true),
            });

        // Одна подписка на весь экран: второе нажатие, пока первое в пути, не уходит вовсе
        this.#submitSource
            .pipe(
                exhaustMap((pair: ISignInPair): Observable<boolean> => this.#setUp(pair)),
                takeUntilDestroyed()
            )
            .subscribe((done: boolean): void => {
                if (done) {
                    void this.#router.navigateByUrl(HOME_PATH);
                }
            });
    }

    /** Незаполненная форма наверх не уходит: чего не хватает, видно на месте. */
    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();

            return;
        }

        this.#submitSource.next(this.form.getRawValue());
    }

    #opened(open: boolean): void {
        if (open) {
            this.ready.set(true);

            return;
        }

        void this.#router.navigate([SIGN_IN_PATH]);
    }

    #setUp(pair: ISignInPair): Observable<boolean> {
        this.pending.set(true);
        this.faultText.set(null);

        return this.#store.setUp(pair).pipe(
            map((): boolean => true),
            catchError((error: unknown): Observable<boolean> => {
                this.faultText.set(spokenFaultText(error, this.#text.text('setupFailed')));

                return of(false);
            }),
            finalize((): void => this.pending.set(false))
        );
    }
}

import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { AdminSignInFormComponent } from '@rt/message-bus-admin/auth/ui';
import { ESignInFault, ISetupState, ISignInPair, SETUP_PATH } from '@rt/message-bus-admin/auth/util';
import { AdminLocaleSwitchComponent } from '@rt/message-bus-admin/common/core/ui';
import { AdminTextService } from '@rt/message-bus-admin/common/core/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtThemeToggleComponent } from '@rt-tools/ui-kit-v2';
import { catchError, EMPTY, filter, Observable } from 'rxjs';

/**
 * Хост экрана — внешний узел готовой раскладки входа, которую везёт кит. Своего блока у экрана
 * нет: заведи он его, раскладка страницы входа стала бы вторым ответом на тот же вопрос.
 */
const BEM_BLOCK: string = 'login__viewport';

/** Куда вести вошедшего, если он пришёл на вход сам, а не был отправлен с закрытого адреса. */
const HOME_PATH: string = '/';

/**
 * Экран входа.
 *
 * Адрес, с которого человека увели на вход, приезжает параметром запроса и связывается со входом
 * самим роутером. После входа человек попадает туда, куда шёл, а не на первый попавшийся раздел:
 * иначе прямая ссылка теряется ровно в тот момент, когда она нужнее всего.
 *
 * Узел без единой записи входа не имеет, и пришедшего на него уводят на экран первой записи —
 * по ответу приёмника, а не по отказу входа: отказ по паре один на «я ошибся» и «входить некому».
 * Форма при этом рисуется сразу: узел с записями — обычный случай, и ждать ответа ради него
 * значило бы показывать пустую карточку всем и каждый раз.
 */
@Component({
    selector: 'admin-sign-in',
    imports: [AdminLocaleSwitchComponent, AdminSignInFormComponent, BlockDirective, ElemDirective, RtThemeToggleComponent],
    templateUrl: './admin-sign-in.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class AdminSignInComponent {
    readonly #store: AuthStore = inject(AuthStore);
    readonly #router: Router = inject(Router);
    readonly #text: AdminTextService = inject(AdminTextService);

    // Язык переключают здесь же, над карточкой: подписи производные, иначе экран остался бы на
    // прежнем языке ровно под тем переключателем, которым язык и сменили.
    protected readonly appTitle: Signal<string> = computed((): string => this.#text.text('appTitle'));

    protected readonly signInTitle: Signal<string> = computed((): string => this.#text.text('signInTitle'));

    protected readonly pending: Signal<boolean> = this.#store.pending;
    protected readonly fault: Signal<ESignInFault | null> = this.#store.fault;

    public readonly returnTo: InputSignal<string | undefined> = input<string | undefined>(undefined);

    constructor() {
        this.#store
            .setupState()
            .pipe(
                // Приёмник не ответил: вход остаётся входом, и отказ он скажет на самой паре
                catchError((): Observable<never> => EMPTY),
                filter((state: ISetupState): boolean => state.open),
                takeUntilDestroyed()
            )
            .subscribe((): void => {
                void this.#router.navigate([SETUP_PATH]);
            });

        this.#store
            .onDispatch('signed-in')
            .pipe(
                filter((): boolean => this.#store.session() !== null),
                takeUntilDestroyed()
            )
            .subscribe((): void => {
                void this.#router.navigateByUrl(this.returnTo() ?? HOME_PATH);
            });
    }

    protected submit(pair: ISignInPair): void {
        this.#store.signIn(pair);
    }
}

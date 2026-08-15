import { ChangeDetectionStrategy, Component, inject, input, InputSignal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { AdminSignInFormComponent } from '@rt/message-bus-admin/auth/ui';
import { ESignInFault, ISignInPair } from '@rt/message-bus-admin/auth/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtLogoComponent } from '@rt-tools/ui-kit-v2';
import { filter } from 'rxjs';

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
 */
@Component({
    selector: 'admin-sign-in',
    imports: [AdminSignInFormComponent, BlockDirective, ElemDirective, RtLogoComponent],
    templateUrl: './admin-sign-in.component.html',
    styleUrl: './admin-sign-in.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class AdminSignInComponent {
    readonly #store: AuthStore = inject(AuthStore);
    readonly #router: Router = inject(Router);

    protected readonly pending: Signal<boolean> = this.#store.pending;
    protected readonly fault: Signal<ESignInFault | null> = this.#store.fault;

    public readonly returnTo: InputSignal<string | undefined> = input<string | undefined>(undefined);

    constructor() {
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

import { DOCUMENT } from '@angular/common';
import {
    EnvironmentProviders,
    ErrorHandler,
    InjectionToken,
    Service,
    inject,
    provideEnvironmentInitializer,
    makeEnvironmentProviders,
} from '@angular/core';

import { PlatformService } from '@rt-tools/core';

/** Метка ссылки на файл местных кусков темы: по ней служба узнаёт свою ссылку в `head`. */
export const RT_SCOPE_STYLES_MARK: string = 'data-rt-scope-styles';

/** Что приложение говорит службе о файле `tokens.scope.css`. */
export interface IRtScopeStylesOptions {
    /** Адрес файла в приложении: ассет, который сборка копирует с прежним именем. */
    readonly href: string;
    /** Грузить при старте приложения и ждать загрузки до первого кадра. */
    readonly eager?: boolean;
}

/** Объявленные приложением настройки; без них служба ничего не грузит. */
export const RT_SCOPE_STYLES_OPTIONS: InjectionToken<IRtScopeStylesOptions | null> = new InjectionToken<IRtScopeStylesOptions | null>(
    'RT_SCOPE_STYLES_OPTIONS',
    { factory: (): IRtScopeStylesOptions | null => null }
);

/**
 * Подгрузка `tokens.scope.css`: местные куски темы и узлы набора Material ниже корня. Файл подключается
 * после `tokens.base.css`, в конец `head`, чтобы правила плотности в его конце остались последними.
 *
 * Кит сам загрузку не просит: остров темы записывают и разметкой без директивы, а набор Material на
 * узле кит ставит панелям сам. Просит приложение: `ensure()` в нужный момент или `eager: true`.
 */
@Service()
export class RtScopeStylesService {
    readonly #options: IRtScopeStylesOptions | null = inject(RT_SCOPE_STYLES_OPTIONS);
    readonly #document: Document = inject(DOCUMENT);
    readonly #platform: PlatformService = inject(PlatformService);
    #pending: Promise<void> | null = null;

    /**
     * Загружает файл один раз. Без объявленного адреса и на сервере не делает ничего. Файл, который
     * приложение уже подключило само на тот же адрес, считается загруженным. Отказ убирает ссылку и
     * возвращается отказом; следующий вызов пробует снова.
     */
    public ensure(): Promise<void> {
        const href: string | undefined = this.#options?.href;
        if (!href || !this.#platform.isPlatformBrowser) {
            return Promise.resolve();
        }
        if (this.#pending !== null) {
            return this.#pending;
        }
        if (this.#documentHolds(href)) {
            return Promise.resolve();
        }

        this.#pending = new Promise<void>((resolve: () => void, reject: (reason: Error) => void): void => {
            const link: HTMLLinkElement = this.#document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.setAttribute(RT_SCOPE_STYLES_MARK, '');
            link.addEventListener('load', (): void => resolve());
            link.addEventListener('error', (): void => {
                link.remove();
                this.#pending = null;
                reject(new Error(`the scope styles did not load: ${href}`));
            });
            this.#document.head.appendChild(link);
        });

        return this.#pending;
    }

    /** Есть ли в странице своя ссылка службы или ссылка приложения на тот же адрес. */
    #documentHolds(href: string): boolean {
        if (this.#document.head.querySelector(`link[${RT_SCOPE_STYLES_MARK}]`) !== null) {
            return true;
        }
        return Array.from(this.#document.head.querySelectorAll('link[rel="stylesheet"]')).some(
            (link: Element): boolean => link.getAttribute('href') === href
        );
    }
}

/**
 * Объявляет адрес файла местных кусков темы. С `eager: true` файл грузится при старте приложения, и
 * приложение ждёт его до первого кадра; отказ загрузки не мешает запуску, а уходит обработчику ошибок приложения.
 */
export function provideRtScopeStyles(options: IRtScopeStylesOptions): EnvironmentProviders {
    return makeEnvironmentProviders([
        { provide: RT_SCOPE_STYLES_OPTIONS, useValue: options },
        ...(options.eager === true
            ? [
                  provideEnvironmentInitializer((): Promise<void> => {
                      const errors: ErrorHandler = inject(ErrorHandler);

                      return inject(RtScopeStylesService)
                          .ensure()
                          .catch((error: Error): void => errors.handleError(error));
                  }),
              ]
            : []),
    ]);
}

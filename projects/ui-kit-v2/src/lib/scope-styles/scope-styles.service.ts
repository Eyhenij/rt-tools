import { DOCUMENT } from '@angular/common';
import {
    EnvironmentProviders,
    ErrorHandler,
    InjectionToken,
    Service,
    inject,
    isDevMode,
    makeEnvironmentProviders,
    provideAppInitializer,
} from '@angular/core';

import { PlatformService } from '@rt-tools/core';

/** Метка ссылки на файл местных кусков темы: по ней служба узнаёт свою ссылку в `head`. */
export const RT_SCOPE_STYLES_MARK: string = 'data-rt-scope-styles';

/** Сколько ждать загрузки файла, миллисекунд: дольше приложение не держит ни запрос, ни старт. */
export const RT_SCOPE_STYLES_TIMEOUT: number = 10000;

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
 * после `tokens.base.css`, в конец `head`, чтобы правила плотности в его конце остались последними на
 * момент вставки: стили, которые приложение добавит позже, встанут после.
 *
 * Кит сам загрузку не просит: остров темы записывают и разметкой без директивы, а набор Material на
 * узле кит ставит панелям сам. Просит приложение: `ensure()` в нужный момент или `eager: true`.
 */
@Service()
export class RtScopeStylesService {
    readonly #options: IRtScopeStylesOptions | null = inject(RT_SCOPE_STYLES_OPTIONS);
    readonly #document: Document = inject(DOCUMENT);
    readonly #platform: PlatformService = inject(PlatformService);
    readonly #errors: ErrorHandler = inject(ErrorHandler);
    #pending: Promise<void> | null = null;
    #link: HTMLLinkElement | null = null;
    #missingOptionsReported: boolean = false;

    /**
     * Загружает файл один раз. На сервере не делает ничего. Без объявленного адреса не грузит и в режиме
     * разработки один раз сообщает об этом обработчику ошибок. Файл, который приложение уже подключило само
     * на тот же адрес, считается загруженным. Ссылку, что ещё идёт, ждёт и вторая копия службы. Отказ или
     * молчание дольше `RT_SCOPE_STYLES_TIMEOUT` убирает ссылку и возвращается отказом: следующий вызов
     * пробует снова.
     */
    public ensure(): Promise<void> {
        if (!this.#platform.isPlatformBrowser) {
            return Promise.resolve();
        }
        const href: string | undefined = this.#options?.href;
        if (!href) {
            this.#reportMissingOptions();
            return Promise.resolve();
        }
        if (this.#pending !== null && this.#link?.isConnected === true) {
            return this.#pending;
        }

        const marked: HTMLLinkElement | null = this.#document.head.querySelector<HTMLLinkElement>(`link[${RT_SCOPE_STYLES_MARK}]`);
        if (marked !== null) {
            this.#link = marked;
            this.#pending = this.#settle(marked, href);
            return this.#pending;
        }
        if (this.#applicationHolds(href)) {
            return Promise.resolve();
        }

        const link: HTMLLinkElement = this.#document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute(RT_SCOPE_STYLES_MARK, '');
        this.#link = link;
        this.#pending = this.#settle(link, href);
        this.#document.head.appendChild(link);

        return this.#pending;
    }

    /** Ждёт `load` ссылки; `error` и молчание дольше срока убирают ссылку и отказывают. */
    #settle(link: HTMLLinkElement, href: string): Promise<void> {
        if (link.sheet) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve: () => void, reject: (reason: Error) => void): void => {
            const guard: { timer?: ReturnType<typeof setTimeout> } = {};
            const fail: () => void = (): void => {
                clearTimeout(guard.timer);
                link.remove();
                this.#pending = null;
                this.#link = null;
                reject(new Error(`the scope styles did not load: ${href}`));
            };
            guard.timer = setTimeout(fail, RT_SCOPE_STYLES_TIMEOUT);
            link.addEventListener('load', (): void => {
                clearTimeout(guard.timer);
                resolve();
            });
            link.addEventListener('error', fail);
        });
    }

    /** Есть ли в странице ссылка приложения на тот же адрес: сравниваются разрешённые адреса, не строки. */
    #applicationHolds(href: string): boolean {
        const wanted: string = new URL(href, this.#document.baseURI).href;

        return Array.from(this.#document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).some(
            (link: HTMLLinkElement): boolean => link.href === wanted
        );
    }

    #reportMissingOptions(): void {
        if (isDevMode() && !this.#missingOptionsReported) {
            this.#missingOptionsReported = true;
            this.#errors.handleError(
                new Error('RtScopeStylesService.ensure() was called, but provideRtScopeStyles({ href }) was not declared')
            );
        }
    }
}

/**
 * Объявляет адрес файла местных кусков темы. С `eager: true` файл грузится при старте приложения, и
 * приложение ждёт его до первого кадра; отказ загрузки не мешает запуску, а уходит обработчику ошибок
 * приложения.
 */
export function provideRtScopeStyles(options: IRtScopeStylesOptions): EnvironmentProviders {
    return makeEnvironmentProviders([
        { provide: RT_SCOPE_STYLES_OPTIONS, useValue: options },
        ...(options.eager === true
            ? [
                  provideAppInitializer((): Promise<void> => {
                      const errors: ErrorHandler = inject(ErrorHandler);

                      return inject(RtScopeStylesService)
                          .ensure()
                          .catch((error: Error): void => errors.handleError(error));
                  }),
              ]
            : []),
    ]);
}

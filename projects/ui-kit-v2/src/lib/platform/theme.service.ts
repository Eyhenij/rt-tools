import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, effect, Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';

import { PlatformService, StorageService, WINDOW } from '@rt-tools/core';

import { IRtKitConfig } from '../config/rt-kit-config.model';
import { RT_KIT_CONFIG } from '../config/rt-kit-config.providers';
import { ERtStorageKeys } from './storage-keys.enum';
import { ITheme } from './theme.model';

const DEFAULT_CHOICE: ITheme.Choice = 'light';

/** Запрос, которым браузер отвечает о предпочтении тёмного вида. */
const DARK_QUERY: string = '(prefers-color-scheme: dark)';

/**
 * Глобальный сервис темы. Применяет `data-theme` к `<html>` через DOM-эффект,
 * персистит выбор под единственным device-level ключом. Тема не привязана к
 * пользователю: на одном устройстве последняя выставленная тема переживает
 * вход, выход и перезагрузку.
 *
 * Хранится **выбор**, а не вид, в который он разрешился: «за машиной»,
 * записанное тёмным видом, перестало бы идти за машиной с первой же
 * перезагрузки, и на экране ничто бы об этом не сказало.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
    readonly #storage: StorageService = inject(StorageService);
    readonly #document: Document = inject(DOCUMENT);
    readonly #platform: PlatformService = inject(PlatformService);
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;
    readonly #config: IRtKitConfig.Config = inject(RT_KIT_CONFIG);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #choice: WritableSignal<ITheme.Choice> = signal<ITheme.Choice>(this.#readOrDefault());

    /** Что ответила машина про тёмный вид. Меняется на живой странице — потому сигнал. */
    readonly #machinePrefersDark: WritableSignal<boolean> = signal<boolean>(false);

    /** Что выбрано: два вида и «за машиной». Хранится именно это. */
    public readonly choice: Signal<ITheme.Choice> = this.#choice.asReadonly();

    /** Вид, в котором страница нарисована. «За машиной» разрешается здесь. */
    public readonly current: Signal<ITheme.Mode> = computed((): ITheme.Mode => {
        const choice: ITheme.Choice = this.#choice();

        if (choice !== 'auto') {
            return choice;
        }

        return this.#machinePrefersDark() ? 'dark' : 'light';
    });

    public readonly isDark: Signal<boolean> = computed((): boolean => this.current() === 'dark');

    constructor() {
        this.#watchMachine();

        effect((): void => {
            const mode: ITheme.Mode = this.current();
            const choice: ITheme.Choice = this.#choice();
            // Prerender/SSR-окружение не даёт documentElement.dataset — тему
            // применяем только в браузере, серверный HTML остаётся в light.
            if (!this.#platform.isPlatformBrowser) {
                return;
            }
            this.#document.documentElement.dataset['theme'] = mode;
            this.#storage.setItem(ERtStorageKeys.Theme, choice);
        });
    }

    /**
     * Переключает светлое и тёмное.
     *
     * Из «за машиной» уходит в противоположность тому, что сейчас на экране:
     * человек жмёт переключатель, глядя на нарисованное, и ждёт обратного ему.
     */
    public toggle(): void {
        this.#choice.set(this.current() === 'light' ? 'dark' : 'light');
    }

    public setTheme(theme: ITheme.Choice): void {
        this.#choice.set(theme);
    }

    /**
     * Подписка на ответ браузера о тёмном виде — одна, на весь век службы.
     *
     * Без неё «за машиной» превратилось бы в четвёртый способ записать вид той
     * минуты, когда страницу открыли: настройка машины меняется на живой
     * странице, и выбор обязан идти за ней без перезагрузки.
     */
    #watchMachine(): void {
        if (!this.#platform.isPlatformBrowser) {
            return;
        }

        /*
         * Спросить машину умеет не всякое окно, назвавшееся браузерным: среда тестов потребителя
         * даёт именно такое. Служба корневая — упав здесь, она роняет каждый тест, поднявший хоть
         * один компонент кита, и чинить это потребителю нечем. Проверка среды тут не поможет: она
         * отвечает про место прорисовки, а вопрос — про умение самого окна.
         */
        if (typeof this.#window.matchMedia !== 'function') {
            return;
        }

        const query: MediaQueryList = this.#window.matchMedia(DARK_QUERY);
        this.#machinePrefersDark.set(query.matches);

        const listener: (event: MediaQueryListEvent) => void = (event: MediaQueryListEvent): void => {
            this.#machinePrefersDark.set(event.matches);
        };

        query.addEventListener('change', listener);
        this.#destroyRef.onDestroy((): void => query.removeEventListener('change', listener));
    }

    /**
     * Что выбрано на старте: сохранённое, а если его нет или оно киту незнакомо —
     * общее умолчание настроек, за ним умолчание кита.
     *
     * Слово, оставленное прошлым выпуском кита или рукой в консоли, выбором не
     * считается: отвечают настройки.
     */
    #readOrDefault(): ITheme.Choice {
        const fallback: ITheme.Choice = this.#config.global?.theme ?? DEFAULT_CHOICE;
        const stored: string | null = this.#storage.getItem<string>(ERtStorageKeys.Theme) ?? null;

        return stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : fallback;
    }
}

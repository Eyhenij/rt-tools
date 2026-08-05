import { DOCUMENT } from '@angular/common';
import { computed, effect, Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';

import { PlatformService, StorageService } from '@rt-tools/core';

import { ERtStorageKeys } from './storage-keys.const';
import { ITheme } from './theme.model';

const DEFAULT_THEME: ITheme.Mode = 'light';

/**
 * Глобальный сервис темы. Применяет `data-theme` к `<html>` через DOM-эффект,
 * персистит выбор под единственным device-level ключом. Тема не привязана к
 * пользователю: на одном устройстве последняя выставленная тема переживает
 * вход, выход и перезагрузку.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
    readonly #storage: StorageService = inject(StorageService);
    readonly #document: Document = inject(DOCUMENT);
    readonly #platform: PlatformService = inject(PlatformService);

    readonly #currentTheme: WritableSignal<ITheme.Mode> = signal<ITheme.Mode>(this.#readOrDefault());

    public readonly current: Signal<ITheme.Mode> = this.#currentTheme.asReadonly();

    public readonly isDark: Signal<boolean> = computed((): boolean => this.#currentTheme() === 'dark');

    constructor() {
        effect((): void => {
            const theme: ITheme.Mode = this.#currentTheme();
            // Prerender/SSR-окружение не даёт documentElement.dataset — тему
            // применяем только в браузере, серверный HTML остаётся в light.
            if (!this.#platform.isPlatformBrowser) {
                return;
            }
            this.#document.documentElement.dataset['theme'] = theme;
            this.#storage.setItem(ERtStorageKeys.Theme, theme);
        });
    }

    public toggle(): void {
        this.#currentTheme.update((mode: ITheme.Mode): ITheme.Mode => (mode === 'light' ? 'dark' : 'light'));
    }

    public setTheme(theme: ITheme.Mode): void {
        this.#currentTheme.set(theme);
    }

    #readOrDefault(): ITheme.Mode {
        const stored: ITheme.Mode | null = this.#storage.getItem<ITheme.Mode>(ERtStorageKeys.Theme) ?? null;
        return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
    }
}

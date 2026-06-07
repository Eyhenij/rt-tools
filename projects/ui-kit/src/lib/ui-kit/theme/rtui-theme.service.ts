import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { LOCAL_STORAGE, PlatformService } from '@rt-tools/core';

import { RT_DARK_CLASS, RT_THEME_AUTO_CLASS, RT_THEME_ENUM, RT_THEME_STORAGE_KEY, RtThemeType } from './rtui-theme.types';

/**
 * Global theme switcher for the rt-tools design tokens.
 *
 * Applies `.rt-dark` / `.rt-theme-auto` to `<html>`; all semantic tokens
 * (`--rt-*`) adapt through `color-scheme` + `light-dark()`.
 * The chosen theme is persisted to localStorage (`rt-theme` key).
 *
 * `auto` follows the OS preference (`prefers-color-scheme`).
 */
@Injectable({ providedIn: 'root' })
export class RtThemeService {
    readonly #document: Document = inject(DOCUMENT);
    readonly #platformService: PlatformService = inject(PlatformService);
    // falls back to the native localStorage when the app does not call provideRtStorage()
    readonly #storage: Storage | null = inject(LOCAL_STORAGE, { optional: true }) ?? this.#document.defaultView?.localStorage ?? null;

    readonly #theme: WritableSignal<RtThemeType> = signal<RtThemeType>(this.#restore());

    public readonly theme: Signal<RtThemeType> = this.#theme.asReadonly();

    constructor() {
        effect((): void => {
            this.#apply(this.#theme());
        });
    }

    public setTheme(theme: RtThemeType): void {
        this.#theme.set(theme);

        if (this.#platformService.isPlatformBrowser && this.#storage) {
            this.#storage.setItem(RT_THEME_STORAGE_KEY, theme);
        }
    }

    /** Toggles between light and dark (auto resolves to its opposite visual state). */
    public toggle(): void {
        this.setTheme(this.#isDarkApplied() ? RT_THEME_ENUM.LIGHT : RT_THEME_ENUM.DARK);
    }

    #restore(): RtThemeType {
        if (!this.#platformService.isPlatformBrowser || !this.#storage) {
            return RT_THEME_ENUM.LIGHT;
        }

        const stored: string | null = this.#storage.getItem(RT_THEME_STORAGE_KEY);

        return Object.values(RT_THEME_ENUM).includes(stored as RT_THEME_ENUM) ? (stored as RtThemeType) : RT_THEME_ENUM.LIGHT;
    }

    #apply(theme: RtThemeType): void {
        if (!this.#platformService.isPlatformBrowser) {
            return;
        }

        const classList: DOMTokenList = this.#document.documentElement.classList;

        classList.toggle(RT_DARK_CLASS, theme === RT_THEME_ENUM.DARK);
        classList.toggle(RT_THEME_AUTO_CLASS, theme === RT_THEME_ENUM.AUTO);
    }

    #isDarkApplied(): boolean {
        if (this.#theme() === RT_THEME_ENUM.AUTO) {
            return this.#platformService.isPlatformBrowser && this.#document.defaultView
                ? this.#document.defaultView.matchMedia('(prefers-color-scheme: dark)').matches
                : false;
        }

        return this.#theme() === RT_THEME_ENUM.DARK;
    }
}

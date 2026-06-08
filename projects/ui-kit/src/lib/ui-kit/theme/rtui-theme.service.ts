import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { LOCAL_STORAGE, PlatformService } from '@rt-tools/core';

import {
    RT_COLOR_SCHEME_STORAGE_KEY,
    RT_DARK_CLASS,
    RT_DEFAULT_SCHEME,
    RT_SCHEME_ATTRIBUTE,
    RT_THEME_AUTO_CLASS,
    RT_THEME_ENUM,
    RT_THEME_STORAGE_KEY,
    RtColorSchemeRamp,
    RtThemeType,
} from './rtui-theme.types';

/**
 * Global theme + color-scheme switcher for the rt-tools design tokens.
 *
 * **Theme** (`light`/`dark`/`auto`): applies `.rt-dark` / `.rt-theme-auto` to
 * `<html>`; semantic tokens (`--rt-*`) adapt through `color-scheme` + `light-dark()`.
 * Persisted to localStorage (`rt-theme`). `auto` follows the OS preference.
 *
 * **Color scheme** (brand palette): toggles `data-rt-scheme="<name>"` on `<html>`,
 * which activates a `[data-rt-scheme]` block (emitted by the `rt.color-scheme` Sass
 * mixin or injected at runtime via {@link registerColorScheme}). It overrides only
 * the accent-role rows `--rt-color-{role}-{N}`, so the whole accent layer recolors
 * while semantic token names stay stable. Orthogonal to light/dark; persisted to
 * localStorage (`rt-color-scheme`).
 */
@Injectable({ providedIn: 'root' })
export class RtThemeService {
    readonly #document: Document = inject(DOCUMENT);
    readonly #platformService: PlatformService = inject(PlatformService);
    // falls back to the native localStorage when the app does not call provideRtStorage()
    readonly #storage: Storage | null = inject(LOCAL_STORAGE, { optional: true }) ?? this.#document.defaultView?.localStorage ?? null;

    readonly #theme: WritableSignal<RtThemeType> = signal<RtThemeType>(this.#restore());
    readonly #colorScheme: WritableSignal<string | null> = signal<string | null>(this.#restoreScheme());

    public readonly theme: Signal<RtThemeType> = this.#theme.asReadonly();
    public readonly colorScheme: Signal<string | null> = this.#colorScheme.asReadonly();

    constructor() {
        effect((): void => {
            this.#apply(this.#theme());
        });

        effect((): void => {
            this.#applyScheme(this.#colorScheme());
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

    /**
     * Activates a registered color scheme by name, or clears it with `null`/`'default'`.
     * Orthogonal to the light/dark theme; persisted to localStorage.
     */
    public setColorScheme(name: string | null): void {
        const normalized: string | null = !name || name === RT_DEFAULT_SCHEME ? null : name;
        this.#colorScheme.set(normalized);

        if (this.#platformService.isPlatformBrowser && this.#storage) {
            if (normalized) {
                this.#storage.setItem(RT_COLOR_SCHEME_STORAGE_KEY, normalized);
            } else {
                this.#storage.removeItem(RT_COLOR_SCHEME_STORAGE_KEY);
            }
        }
    }

    /**
     * Injects (or replaces) a color scheme's `[data-rt-scheme]` block at runtime —
     * the JS twin of the `rt.color-scheme` Sass mixin. Browser-only (no-op on server;
     * for SSR/brand-critical schemes prefer the Sass path). Does not activate the
     * scheme — call {@link setColorScheme} afterwards.
     */
    public registerColorScheme(name: string, ramp: RtColorSchemeRamp): void {
        if (!this.#platformService.isPlatformBrowser) {
            return;
        }

        const id: string = `rt-color-scheme-${name}`;
        const existing: HTMLElement | null = this.#document.getElementById(id);
        const style: HTMLStyleElement = (existing as HTMLStyleElement | null) ?? this.#document.createElement('style');

        style.id = id;
        style.textContent = this.#buildSchemeCss(name, ramp);

        if (!existing) {
            this.#document.head.appendChild(style);
        }
    }

    #restore(): RtThemeType {
        if (!this.#platformService.isPlatformBrowser || !this.#storage) {
            return RT_THEME_ENUM.LIGHT;
        }

        const stored: string | null = this.#storage.getItem(RT_THEME_STORAGE_KEY);

        return Object.values(RT_THEME_ENUM).includes(stored as RT_THEME_ENUM) ? (stored as RtThemeType) : RT_THEME_ENUM.LIGHT;
    }

    #restoreScheme(): string | null {
        if (!this.#platformService.isPlatformBrowser || !this.#storage) {
            return null;
        }

        const stored: string | null = this.#storage.getItem(RT_COLOR_SCHEME_STORAGE_KEY);

        return stored && stored !== RT_DEFAULT_SCHEME ? stored : null;
    }

    #apply(theme: RtThemeType): void {
        if (!this.#platformService.isPlatformBrowser) {
            return;
        }

        const classList: DOMTokenList = this.#document.documentElement.classList;

        classList.toggle(RT_DARK_CLASS, theme === RT_THEME_ENUM.DARK);
        classList.toggle(RT_THEME_AUTO_CLASS, theme === RT_THEME_ENUM.AUTO);
    }

    #applyScheme(name: string | null): void {
        if (!this.#platformService.isPlatformBrowser) {
            return;
        }

        const root: HTMLElement = this.#document.documentElement;

        if (name) {
            root.setAttribute(RT_SCHEME_ATTRIBUTE, name);
        } else {
            root.removeAttribute(RT_SCHEME_ATTRIBUTE);
        }
    }

    /** Builds the `[data-rt-scheme="<name>"] { --rt-color-{role}-{N}: … }` block (mirrors the Sass mixin). */
    #buildSchemeCss(name: string, ramp: RtColorSchemeRamp): string {
        const declarations: string = Object.entries(ramp)
            .flatMap(([role, tones]: [string, Record<number, string> | undefined]): string[] =>
                Object.entries(tones ?? {}).map(([tone, value]: [string, string]): string => `--rt-color-${role}-${tone}:${value};`)
            )
            .join('');

        return `[${RT_SCHEME_ATTRIBUTE}="${name}"]{${declarations}}`;
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

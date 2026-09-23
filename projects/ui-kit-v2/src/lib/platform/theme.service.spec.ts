import { PLATFORM_ID, ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { setMediaQueryMatches, resetMediaQueries } from '../../testing/match-media-stub';
import { provideRtKitTesting } from '../../testing/rt-kit-testing';
import { IRtKitConfig } from '../config/rt-kit-config.model';
import { provideRtKit } from '../config/rt-kit-config.providers';
import { ERtStorageKeys } from './storage-keys.enum';
import { ThemeService } from './theme.service';

/** Тот же запрос, которым служба спрашивает машину. */
const DARK_QUERY: string = '(prefers-color-scheme: dark)';

/**
 * Поднимает службу заново — это и есть перезагрузка страницы: служба читает
 * хранилище один раз, при создании.
 */
function service(config?: IRtKitConfig.Config, onServer: boolean = false): ThemeService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        providers: [
            ...provideRtKitTesting(),
            ...(config === undefined ? [] : [provideRtKit(config)]),
            ...(onServer ? [{ provide: PLATFORM_ID, useValue: 'server' }] : []),
        ],
    });

    return TestBed.inject(ThemeService);
}

/** Эффект, который пишет признак и хранилище, срабатывает на прогоне отрисовки. */
function flush(): void {
    TestBed.inject(ApplicationRef).tick();
}

function signAtRoot(): string | undefined {
    return document.documentElement.dataset['theme'];
}

/** Хранилище кита пишет значения через JSON — читаем их тем же способом. */
function kept(): string | null {
    const raw: string | null = localStorage.getItem(ERtStorageKeys.Theme);

    return raw === null ? null : (JSON.parse(raw) as string);
}

/** Кладёт значение так, как его положил бы сам кит. */
function keep(value: string): void {
    localStorage.setItem(ERtStorageKeys.Theme, JSON.stringify(value));
}

describe('тема кита', (): void => {
    beforeEach((): void => {
        localStorage.clear();
        resetMediaQueries();
        delete document.documentElement.dataset['theme'];
    });

    it('SC-UKV-336 — настройки задают тему старта тому, кто ничего не выбирал', (): void => {
        const theme: ThemeService = service({ global: { theme: 'dark' } });
        flush();

        expect(theme.current()).toBe('dark');
        expect(signAtRoot()).toBe('dark');
    });

    it('SC-UKV-337 — уже сохранённый выбор выигрывает у настроек', (): void => {
        keep('dark');

        expect(service({ global: { theme: 'light' } }).current()).toBe('dark');
    });

    it('SC-UKV-338 — сохранённое слово, которого кит не знает, игнорируется', (): void => {
        keep('contrast');

        expect(service({ global: { theme: 'dark' } }).current()).toBe('dark');
    });

    it('SC-UKV-339 — выбор переживает перезагрузку', (): void => {
        const before: ThemeService = service();
        before.setTheme('dark');
        flush();

        // Перезагрузка: служба поднимается заново и читает хранилище устройства.
        expect(service().current()).toBe('dark');
    });

    it('SC-UKV-340 — «за машиной» хранится как выбрано, а не как разрешилось', (): void => {
        setMediaQueryMatches(DARK_QUERY, true);
        const theme: ThemeService = service();
        theme.setTheme('auto');
        flush();

        expect(theme.current()).toBe('dark');
        expect(kept()).toBe('auto');

        // Перезагрузка не превращает выбор в тот вид, в который он разрешился.
        const reloaded: ThemeService = service();

        expect(reloaded.choice()).toBe('auto');
        expect(reloaded.current()).toBe('dark');
    });

    it('SC-UKV-341 — вид идёт за машиной на живой странице', (): void => {
        const theme: ThemeService = service({ global: { theme: 'auto' } });
        flush();

        expect(theme.current()).toBe('light');

        setMediaQueryMatches(DARK_QUERY, true);
        flush();

        expect(theme.current()).toBe('dark');
        expect(signAtRoot()).toBe('dark');
        // Выбор при этом не менялся: человек ничего не нажимал.
        expect(theme.choice()).toBe('auto');
    });

    it('SC-UKV-341 — переключатель из «за машиной» уходит в противоположное нарисованному', (): void => {
        setMediaQueryMatches(DARK_QUERY, true);
        const theme: ThemeService = service({ global: { theme: 'auto' } });
        flush();

        theme.toggle();

        expect(theme.choice()).toBe('light');
        expect(theme.current()).toBe('light');
    });

    it('SC-UKV-342 — без окна кит не трогает ни хранилище, ни корень', (): void => {
        setMediaQueryMatches(DARK_QUERY, true);
        const theme: ThemeService = service({ global: { theme: 'auto' } }, true);
        flush();

        expect(signAtRoot()).toBeUndefined();
        expect(kept()).toBeNull();
        // Машину спрашивать некого: вывод остаётся светлым.
        expect(theme.current()).toBe('light');
    });
});

import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../testing/rt-kit-testing';
import { ERtStorageKeys } from './storage-keys.enum';
import { RtThemeScopeDirective } from './rt-theme-scope.directive';
import { ITheme } from './theme.model';
import { ThemeService } from './theme.service';

/** Узел со своей темой, а внутри него — ещё один: вложенность проверяется на них. */
@Component({
    selector: 'rt-theme-scope-host',
    template: `
        <section qa-dataid="outer" [rtTheme]="outer()">
            <span qa-dataid="inner-holder" [rtTheme]="inner()"></span>
        </section>
        <span qa-dataid="outside"></span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtThemeScopeDirective],
})
class ThemeScopeHostComponent {
    public readonly outer: WritableSignal<ITheme.Mode | ''> = signal<ITheme.Mode | ''>('dark');
    public readonly inner: WritableSignal<ITheme.Mode | ''> = signal<ITheme.Mode | ''>('');
}

function node(fixture: ComponentFixture<unknown>, id: string): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector(`[qa-dataid="${id}"]`) as HTMLElement;
}

function sign(fixture: ComponentFixture<unknown>, id: string): string | null {
    return node(fixture, id).getAttribute('data-theme');
}

describe('местный кусок темы', (): void => {
    beforeEach((): void => {
        localStorage.clear();
        delete document.documentElement.dataset['theme'];
    });

    it('SC-UKV-343 — узел со своей тёмной темой несёт признак, соседний снаружи — нет', (): void => {
        const fixture: ComponentFixture<ThemeScopeHostComponent> = createRtFixture(ThemeScopeHostComponent);

        expect(sign(fixture, 'outer')).toBe('dark');
        expect(sign(fixture, 'outside')).toBeNull();
        // Признак страницы при этом не трогается вовсе.
        expect(document.documentElement.dataset['theme']).toBeUndefined();
    });

    it('SC-UKV-344 — узел со своей светлой темой несёт светлый признак', (): void => {
        const fixture: ComponentFixture<ThemeScopeHostComponent> = createRtFixture(ThemeScopeHostComponent);
        fixture.componentInstance.outer.set('light');
        fixture.detectChanges();

        expect(sign(fixture, 'outer')).toBe('light');
    });

    it('SC-UKV-345 — обратная метка внутри помеченного узла возвращает набор обратно', (): void => {
        const fixture: ComponentFixture<ThemeScopeHostComponent> = createRtFixture(ThemeScopeHostComponent);
        fixture.componentInstance.inner.set('light');
        fixture.detectChanges();

        expect(sign(fixture, 'outer')).toBe('dark');
        expect(sign(fixture, 'inner-holder')).toBe('light');
    });

    it('SC-UKV-346 — метка, повторённая внутри такой же, ничего не меняет', (): void => {
        const fixture: ComponentFixture<ThemeScopeHostComponent> = createRtFixture(ThemeScopeHostComponent);
        fixture.componentInstance.inner.set('dark');
        fixture.detectChanges();

        expect(sign(fixture, 'outer')).toBe('dark');
        expect(sign(fixture, 'inner-holder')).toBe('dark');
    });

    it('SC-UKV-347 — снятая метка не оставляет на узле признака', (): void => {
        const fixture: ComponentFixture<ThemeScopeHostComponent> = createRtFixture(ThemeScopeHostComponent);

        expect(sign(fixture, 'outer')).toBe('dark');

        fixture.componentInstance.outer.set('');
        fixture.detectChanges();

        expect(sign(fixture, 'outer')).toBeNull();
    });

    it('SC-UKV-348 — местный кусок не трогает ни выбор человека, ни хранилище', (): void => {
        const fixture: ComponentFixture<ThemeScopeHostComponent> = createRtFixture(ThemeScopeHostComponent);
        const theme: ThemeService = fixture.debugElement.injector.get(ThemeService);

        expect(sign(fixture, 'outer')).toBe('dark');
        // Выбор страницы остался светлым, и метка на узле в хранилище не попала.
        expect(theme.choice()).toBe('light');
        expect(localStorage.getItem(ERtStorageKeys.Theme)).toBeNull();
    });
});

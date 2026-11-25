import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { join } from 'node:path';

import * as sass from 'sass';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';

/** Шторка отборов и шторка списка, открытая из неё, — как на телефоне в шапке страницы. */
@Component({
    selector: 'rt-bottom-sheet-stack-host',
    template: `
        <rt-bottom-sheet qa-dataid="sheet-filters" [open]="filters()">
            <p>Отборы</p>
        </rt-bottom-sheet>
        <rt-bottom-sheet qa-dataid="sheet-status" [open]="status()">
            <p>Статус</p>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent],
})
class StackHostComponent {
    public readonly filters: WritableSignal<boolean> = signal<boolean>(true);
    public readonly status: WritableSignal<boolean> = signal<boolean>(false);
}

function sheet(fixture: ComponentFixture<StackHostComponent>, anchor: string): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector(`[qa-dataid="${anchor}"]`) as HTMLElement;
}

function shown(element: HTMLElement): boolean {
    return element.classList.contains('rt-bottom-sheet--open') && !element.classList.contains('rt-bottom-sheet--covered');
}

describe('Стопка шторок', (): void => {
    it('SC-UKV-1631 — шторка, открытая из шторки, подменяет её', (): void => {
        const fixture: ComponentFixture<StackHostComponent> = createRtFixture(StackHostComponent);
        expect(shown(sheet(fixture, 'sheet-filters'))).toBe(true);

        fixture.componentInstance.status.set(true);
        fixture.detectChanges();
        fixture.detectChanges();

        expect(shown(sheet(fixture, 'sheet-status'))).toBe(true);
        expect(shown(sheet(fixture, 'sheet-filters'))).toBe(false);
        // Без `inert`: в ней стоит указатель поля, открывшего верхнюю, и фокус с него не падает.
        expect(sheet(fixture, 'sheet-filters').hasAttribute('inert')).toBe(false);
    });

    it('SC-UKV-1632 — закрытие верхней шторки снова показывает предыдущую', (): void => {
        const fixture: ComponentFixture<StackHostComponent> = createRtFixture(StackHostComponent);
        fixture.componentInstance.status.set(true);
        fixture.detectChanges();
        fixture.detectChanges();

        fixture.componentInstance.status.set(false);
        fixture.detectChanges();
        fixture.detectChanges();

        expect(shown(sheet(fixture, 'sheet-filters'))).toBe(true);
        expect(sheet(fixture, 'sheet-filters').hasAttribute('inert')).toBe(false);
        expect(sheet(fixture, 'sheet-status').classList.contains('rt-bottom-sheet--open')).toBe(false);
    });

    it('SC-UKV-1631 — шторка из шторки — второй экран той же шторки: её высота и шеврон «назад» вместо «×»', (): void => {
        const fixture: ComponentFixture<StackHostComponent> = createRtFixture(StackHostComponent);
        const filters: HTMLElement = sheet(fixture, 'sheet-filters');
        const status: HTMLElement = sheet(fixture, 'sheet-status');
        const panel: HTMLElement = filters.querySelector<HTMLElement>(':scope > .rt-bottom-sheet__panel') as HTMLElement;
        jest.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ height: 420 } as DOMRect);

        fixture.componentInstance.status.set(true);
        fixture.detectChanges();
        fixture.detectChanges();

        expect(status.classList).toContain('rt-bottom-sheet--nested');
        expect(status.style.getPropertyValue('--rt-bottom-sheet-nested-height')).toBe('420px');
        expect(status.querySelector('[qa-dataid="bottom-sheet-back"] button')?.getAttribute('aria-label')).toBe('Back');
        expect(status.querySelector('[qa-dataid="bottom-sheet-close"]')).toBeNull();
        // Первый экран — не вложенный: у него «×».
        expect(filters.classList).not.toContain('rt-bottom-sheet--nested');
        expect(filters.querySelector('[qa-dataid="bottom-sheet-close"]')).not.toBeNull();

        (status.querySelector('[qa-dataid="bottom-sheet-back"] button') as HTMLButtonElement).click();
        fixture.componentInstance.status.set(false);
        fixture.detectChanges();
        fixture.detectChanges();

        expect(shown(filters)).toBe(true);
    });

    it('SC-UKV-1867 — второй экран идёт за высотой первого, когда окно меняет размер', (): void => {
        const fixture: ComponentFixture<StackHostComponent> = createRtFixture(StackHostComponent);
        const status: HTMLElement = sheet(fixture, 'sheet-status');
        const panel: HTMLElement = sheet(fixture, 'sheet-filters').querySelector<HTMLElement>(
            ':scope > .rt-bottom-sheet__panel'
        ) as HTMLElement;
        const height: jest.SpyInstance = jest.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ height: 760 } as DOMRect);
        fixture.componentInstance.status.set(true);
        fixture.detectChanges();
        fixture.detectChanges();
        expect(status.style.getPropertyValue('--rt-bottom-sheet-nested-height')).toBe('760px');

        // Окно повернули: первая шторка стала ниже.
        height.mockReturnValue({ height: 340 });
        window.dispatchEvent(new Event('resize'));
        fixture.detectChanges();

        expect(status.style.getPropertyValue('--rt-bottom-sheet-nested-height')).toBe('340px');

        // Закрытый второй экран за окном больше не следит.
        fixture.componentInstance.status.set(false);
        fixture.detectChanges();
        fixture.detectChanges();
        height.mockReturnValue({ height: 500 });
        window.dispatchEvent(new Event('resize'));
        fixture.detectChanges();

        expect(status.style.getPropertyValue('--rt-bottom-sheet-nested-height')).toBe('340px');
    });

    it('SC-UKV-1631 — второй экран встаёт и уходит без выезда, первый прячется без выезда', (): void => {
        const css: string = sass.compile(join(__dirname, 'rt-bottom-sheet.component.scss'), {
            loadPaths: [join(__dirname, '../../../styles')],
        }).css;
        const nestedPanel: string = css.slice(css.indexOf('.rt-bottom-sheet--nested > .rt-bottom-sheet__panel {'));
        const covered: string = css.slice(css.indexOf('.rt-bottom-sheet--open.rt-bottom-sheet--covered > .rt-bottom-sheet__panel {'));

        expect(nestedPanel.slice(0, nestedPanel.indexOf('}'))).toContain('transition: none');
        expect(nestedPanel.slice(0, nestedPanel.indexOf('}'))).toContain('height: var(--rt-bottom-sheet-nested-height, auto)');
        expect(covered.slice(0, covered.indexOf('}'))).toContain('visibility: hidden');
    });
});

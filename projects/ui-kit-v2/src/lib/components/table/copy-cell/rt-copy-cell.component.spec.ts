import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { By } from '@angular/platform-browser';

import { classesOf, createRtFixture, el, qa, textOf } from '../../../../testing/rt-kit-testing';
import { RtTooltipDirective } from '../../tooltip/rt-tooltip.directive';
import { RtCopyCellComponent } from './rt-copy-cell.component';

/** Двойник буфера: настоящий в среде без браузера ничего не кладёт и молчит об этом. */
class ClipboardDouble {
    public readonly copied: string[] = [];

    public copy(text: string): boolean {
        this.copied.push(text);

        return true;
    }
}

@Component({
    selector: 'rt-copy-cell-host',
    template: `
        <rt-copy-cell [value]="value()" [revealOnHover]="revealOnHover()">
            <span>#7 — Тур в Сочи</span>
        </rt-copy-cell>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtCopyCellComponent],
})
class CopyCellHostComponent {
    public readonly value: WritableSignal<string | number | null> = signal<string | number | null>(null);
    public readonly revealOnHover: WritableSignal<boolean> = signal<boolean>(true);
}

let clipboard: ClipboardDouble;

function setup(): ComponentFixture<CopyCellHostComponent> {
    clipboard = new ClipboardDouble();

    return createRtFixture(CopyCellHostComponent, {}, { providers: [{ provide: Clipboard, useValue: clipboard }] });
}

/**
 * Наведение с подменёнными ширинами: раскладку среда без браузера не считает, и обрезка сама по
 * себе не наступает. Подменяются ровно те две величины, по которым её меряет компонент.
 */
function hoverWith(fixture: ComponentFixture<CopyCellHostComponent>, scrollWidth: number, clientWidth: number): string {
    const content: HTMLElement = qa(fixture, 'copy-cell-content')?.nativeElement as HTMLElement;
    const host: HTMLElement = el(fixture, 'rt-copy-cell')?.nativeElement as HTMLElement;

    Object.defineProperty(content, 'scrollWidth', { configurable: true, value: scrollWidth });
    Object.defineProperty(content, 'clientWidth', { configurable: true, value: clientWidth });

    host.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    return fixture.debugElement.query(By.directive(RtTooltipDirective)).injector.get(RtTooltipDirective).text();
}

function pressCopy(fixture: ComponentFixture<CopyCellHostComponent>): void {
    const button: HTMLElement = qa(fixture, 'copy-cell-button')?.nativeElement as HTMLElement;

    button.querySelector('button')?.click();
    fixture.detectChanges();
}

describe('RtCopyCellComponent', (): void => {
    it('показывает спроецированное содержимое', (): void => {
        expect(textOf(qa(setup(), 'copy-cell-content'))).toBe('#7 — Тур в Сочи');
    });

    it('без своего значения в буфер уходит показанный текст', (): void => {
        const fixture: ComponentFixture<CopyCellHostComponent> = setup();

        pressCopy(fixture);

        expect(clipboard.copied).toEqual(['#7 — Тур в Сочи']);
    });

    it('своё значение перебивает показанный текст', (): void => {
        // Ячейка показывает «#7 — Тур в Сочи», а вставить нужно один номер.
        const fixture: ComponentFixture<CopyCellHostComponent> = setup();

        fixture.componentInstance.value.set(7);
        fixture.detectChanges();
        pressCopy(fixture);

        expect(clipboard.copied).toEqual(['7']);
    });

    it('после копирования кнопка меняет подпись — иначе нажатие ничем не отзывается', (): void => {
        const fixture: ComponentFixture<CopyCellHostComponent> = setup();
        const before: string | null = (qa(fixture, 'copy-cell-button')?.nativeElement as HTMLElement)
            .querySelector('button')
            ?.getAttribute('aria-label') as string | null;

        pressCopy(fixture);

        const after: string | null = (qa(fixture, 'copy-cell-button')?.nativeElement as HTMLElement)
            .querySelector('button')
            ?.getAttribute('aria-label') as string | null;

        expect(before).toBe('Copy');
        expect(after).toBe('Copied');
    });

    it('нажатие не будит кликабельную строку вокруг', (): void => {
        // Иначе копирование номера открывало бы карточку тура.
        const fixture: ComponentFixture<CopyCellHostComponent> = setup();
        let bubbled: number = 0;

        (fixture.nativeElement as HTMLElement).addEventListener('click', (): void => void (bubbled += 1));
        pressCopy(fixture);

        expect(bubbled).toBe(0);
    });

    it('обрезанное значение показывает подсказку целиком, а помещающееся — нет', (): void => {
        // Обрезок без подсказки читается как целое значение: человеку нечем узнать, что текст
        // кончается не здесь. У помещающегося подсказка повторяла бы видимое и всплывала бы над
        // каждой ячейкой таблицы.
        const fixture: ComponentFixture<CopyCellHostComponent> = setup();

        expect(hoverWith(fixture, 400, 400)).toBe('');
        expect(hoverWith(fixture, 400, 120)).toBe('#7 — Тур в Сочи');
    });

    it('вне таблицы кнопка держится видимой — строки для наведения там нет', (): void => {
        const fixture: ComponentFixture<CopyCellHostComponent> = setup();

        expect(classesOf(el(fixture, 'rt-copy-cell'))).not.toContain('rt-copy-cell--static');

        fixture.componentInstance.revealOnHover.set(false);
        fixture.detectChanges();

        expect(classesOf(el(fixture, 'rt-copy-cell'))).toContain('rt-copy-cell--static');
    });
});

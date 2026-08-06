import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, hostClasses, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtCollapsibleTextComponent } from './rt-collapsible-text.component';

const PARAGRAPHS: ReadonlyArray<string> = ['Первый абзац описания.', 'Второй абзац описания.'];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtCollapsibleTextComponent> {
    return createRtFixture(RtCollapsibleTextComponent, { paragraphs: PARAGRAPHS, ...inputs });
}

function body(fixture: ComponentFixture<RtCollapsibleTextComponent>): HTMLElement {
    return qa(fixture, 'collapsible-text-body')?.nativeElement as HTMLElement;
}

describe('RtCollapsibleTextComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-collapsible-text');
    });

    it('рисует по абзацу на каждый элемент набора', (): void => {
        expect(qaAll(setup(), 'collapsible-text-paragraph').map((node: DebugElement): string => textOf(node))).toEqual([
            'Первый абзац описания.',
            'Второй абзац описания.',
        ]);
    });

    describe('свёрнутое состояние', (): void => {
        it('текст обрезан по числу строк', (): void => {
            expect(classesOf(body(setup()))).toContain('rt-collapsible-text__text--clamped');
        });

        it('без входа обрезка — шесть строк', (): void => {
            expect(body(setup()).style.getPropertyValue('-webkit-line-clamp')).toBe('6');
        });

        it('число строк задаётся входом и принимает строку из атрибута разметки', (): void => {
            expect(body(setup({ clampLines: 3 })).style.getPropertyValue('-webkit-line-clamp')).toBe('3');
            expect(body(setup({ clampLines: '2' })).style.getPropertyValue('-webkit-line-clamp')).toBe('2');
        });
    });

    describe('кнопка «ещё»', (): void => {
        it('не рисуется, пока текст помещается целиком', (): void => {
            // Помещается ли — решает замер после отрисовки. В среде без раскладки
            // (jsdom) высоты равны нулю, переполнения нет, и кнопки быть не должно.
            expect(qa(setup(), 'collapsible-text-toggle')).toBeNull();
        });

        it('появляется после разворота и сообщает своё состояние', (): void => {
            const fixture: ComponentFixture<RtCollapsibleTextComponent> = setup();

            (fixture.componentInstance as unknown as { toggle(): void }).toggle();
            fixture.detectChanges();

            expect(qa(fixture, 'collapsible-text-toggle')?.attributes['aria-expanded']).toBe('true');
            expect(textOf(qa(fixture, 'collapsible-text-toggle'))).toBe('Collapse');
        });

        it('разворот снимает обрезку и убирает ограничение по строкам', (): void => {
            const fixture: ComponentFixture<RtCollapsibleTextComponent> = setup();

            (fixture.componentInstance as unknown as { toggle(): void }).toggle();
            fixture.detectChanges();

            expect(classesOf(body(fixture))).not.toContain('rt-collapsible-text__text--clamped');
            expect(body(fixture).style.getPropertyValue('-webkit-line-clamp')).toBe('');
        });

        it('повторное нажатие сворачивает обратно', (): void => {
            const fixture: ComponentFixture<RtCollapsibleTextComponent> = setup();
            (fixture.componentInstance as unknown as { toggle(): void }).toggle();
            fixture.detectChanges();

            qa(fixture, 'collapsible-text-toggle')?.nativeElement.click();
            fixture.detectChanges();

            expect(classesOf(body(fixture))).toContain('rt-collapsible-text__text--clamped');
        });
    });

    it('пустой набор рисует пустое тело без кнопки', (): void => {
        const fixture: ComponentFixture<RtCollapsibleTextComponent> = setup({ paragraphs: [] });

        expect(qaAll(fixture, 'collapsible-text-paragraph').length).toBe(0);
        expect(qa(fixture, 'collapsible-text-toggle')).toBeNull();
    });
});

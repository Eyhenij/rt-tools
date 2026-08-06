import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, hostClasses, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtTagComponent } from './rt-tag.component';
import { IRtTag } from './rt-tag.model';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtTagComponent> {
    return createRtFixture(RtTagComponent, { value: 'Активен', ...inputs });
}

function pillClasses(fixture: ComponentFixture<RtTagComponent>): string[] {
    return classesOf(qa(fixture, 'tag'));
}

describe('RtTagComponent', (): void => {
    it('рисует переданный текст', (): void => {
        expect(textOf(qa(setup({ value: 'В работе' }), 'tag-text'))).toBe('В работе');
    });

    it('несёт свой BEM-блок и на host-е, и на пилюле', (): void => {
        const fixture: ComponentFixture<RtTagComponent> = setup();

        expect(hostClasses(fixture)).toContain('rt-tag');
        expect(pillClasses(fixture)).toContain('rt-tag');
    });

    describe('палитра', (): void => {
        it('без входа — нейтральная', (): void => {
            expect(pillClasses(setup())).toContain('rt-tag--severity--neutral');
        });

        it.each<IRtTag.Severity>(['info', 'success', 'warning', 'danger', 'secondary', 'neutral'])(
            'палитра %s даёт модификатор и атрибут данных',
            (severity: IRtTag.Severity): void => {
                const fixture: ComponentFixture<RtTagComponent> = setup({ severity });

                expect(pillClasses(fixture)).toContain(`rt-tag--severity--${severity}`);
                expect(qa(fixture, 'tag')?.attributes['data-severity']).toBe(severity);
            }
        );

        it('смена палитры снимает прежний модификатор', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ severity: 'info' });

            setInputs(fixture, { severity: 'danger' });
            fixture.detectChanges();

            expect(pillClasses(fixture)).toContain('rt-tag--severity--danger');
            expect(pillClasses(fixture)).not.toContain('rt-tag--severity--info');
        });
    });

    describe('форма и заливка', (): void => {
        it('без входов — полностью скруглённая сплошная пилюля', (): void => {
            expect(pillClasses(setup())).toEqual(expect.arrayContaining(['rt-tag--shape--pill', 'rt-tag--appearance--solid']));
        });

        it.each<IRtTag.Shape>(['pill', 'square'])('форма %s даёт свой модификатор', (shape: IRtTag.Shape): void => {
            expect(pillClasses(setup({ shape }))).toContain(`rt-tag--shape--${shape}`);
        });

        it.each<IRtTag.Appearance>(['solid', 'outlined'])('заливка %s даёт свой модификатор', (appearance: IRtTag.Appearance): void => {
            expect(pillClasses(setup({ appearance }))).toContain(`rt-tag--appearance--${appearance}`);
        });
    });

    describe('скругление', (): void => {
        it('без входа модификатора скругления нет — радиус берётся из формы', (): void => {
            expect(pillClasses(setup()).some((cls: string): boolean => cls.startsWith('rt-tag--radius'))).toBe(false);
        });

        it.each<IRtTag.Radius>(['none', 'sm', 'md', 'lg', 'full'])('заданный шаг %s перебивает форму', (radius: IRtTag.Radius): void => {
            expect(pillClasses(setup({ radius, shape: 'pill' }))).toContain(`rt-tag--radius--${radius}`);
        });
    });

    describe('иконки', (): void => {
        it('без входов иконок нет', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup();

            expect(el(fixture, '.rt-tag__icon')).toBeNull();
            expect(el(fixture, '.rt-tag__icon-end')).toBeNull();
        });

        it('префикс-иконка рисуется перед текстом', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ icon: 'check' });

            expect(el(fixture, '.rt-tag__icon use')?.attributes['href']).toBe('#rt-icon-check');
        });

        it('суффикс-иконка рисуется после текста', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ iconEnd: 'ico-close' });

            expect(el(fixture, '.rt-tag__icon-end use')?.attributes['href']).toBe('#rt-icon-ico-close');
        });

        it('обе иконки уживаются вместе', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ icon: 'check', iconEnd: 'ico-close' });

            expect(el(fixture, '.rt-tag__icon')).not.toBeNull();
            expect(el(fixture, '.rt-tag__icon-end')).not.toBeNull();
        });
    });

    describe('крестик', (): void => {
        it('без входа крестика нет', (): void => {
            expect(qa(setup(), 'tag-close')).toBeNull();
        });

        it('появляется по входу и помечает пилюлю модификатором', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ closable: true });

            expect(qa(fixture, 'tag-close')).not.toBeNull();
            expect(pillClasses(fixture)).toContain('rt-tag--closable');
        });

        it('клик по крестику поднимает событие с исходным MouseEvent', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ closable: true });
            const seen: MouseEvent[] = [];
            fixture.componentInstance.closed.subscribe((event: MouseEvent): void => {
                seen.push(event);
            });

            const control: DebugElement | null = el(fixture, '[qa-dataid="tag-close"] [qa-dataid="icon-button-control"]');
            control?.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(seen.length).toBe(1);
            expect(seen[0]).toBeInstanceOf(MouseEvent);
        });

        it('клик по крестику не всплывает наружу — пилюля целиком часто сама кликабельна', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ closable: true });
            const outer: jest.Mock = jest.fn();
            (fixture.nativeElement as HTMLElement).parentElement?.addEventListener('click', outer);

            const control: DebugElement | null = el(fixture, '[qa-dataid="tag-close"] [qa-dataid="icon-button-control"]');
            control?.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(outer).not.toHaveBeenCalled();
        });

        it('крестик подписан переведённой подписью, а не ключом', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ closable: true });

            const control: DebugElement | null = el(fixture, '[qa-dataid="tag-close"] [qa-dataid="icon-button-control"]');

            expect(control?.attributes['aria-label']).toBe('Delete');
        });
    });
});

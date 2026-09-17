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
    it('SC-UKV-181 — рисует переданный текст', (): void => {
        expect(textOf(qa(setup({ value: 'В работе' }), 'tag-text'))).toBe('В работе');
    });

    it('SC-UKV-182 — несёт свой BEM-блок и на host-е, и на пилюле', (): void => {
        const fixture: ComponentFixture<RtTagComponent> = setup();

        expect(hostClasses(fixture)).toContain('rt-tag');
        expect(pillClasses(fixture)).toContain('rt-tag');
    });

    describe('палитра', (): void => {
        it('SC-UKV-183 — без входа — нейтральная', (): void => {
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

        it('SC-UKV-184 — смена палитры снимает прежний модификатор', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ severity: 'info' });

            setInputs(fixture, { severity: 'danger' });
            fixture.detectChanges();

            expect(pillClasses(fixture)).toContain('rt-tag--severity--danger');
            expect(pillClasses(fixture)).not.toContain('rt-tag--severity--info');
        });
    });

    describe('ступень размера', (): void => {
        it('SC-UKV-194 — без входа ступень средняя: вид до появления ступеней не меняется', (): void => {
            expect(pillClasses(setup())).toContain('rt-tag--size--md');
        });

        it('SC-UKV-195 — каждая ступень ставит свой модификатор и снимает прежний', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup();

            for (const size of ['sm', 'md', 'lg'] as IRtTag.Size[]) {
                setInputs(fixture, { size });
                fixture.detectChanges();

                const marks: string[] = pillClasses(fixture).filter((one: string): boolean => one.startsWith('rt-tag--size--'));

                expect(marks).toEqual([`rt-tag--size--${size}`]);
            }
        });

        // Ступень значок кладёт числом в стиль хоста, а не классом: ступени `xs`, `sm` и `md`
        // кита значков — 12, 16 и 20 пикселей.
        it('SC-UKV-196 — значок идёт ступенью пилюли, своего входа у него нет', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ icon: 'ico-close' });
            const steps: Record<string, string> = { sm: '12px', md: '16px', lg: '20px' };

            for (const [size, width] of Object.entries(steps)) {
                setInputs(fixture, { size });
                fixture.detectChanges();

                expect((el(fixture, 'rt-icon')?.nativeElement as HTMLElement).style.width).toBe(width);
            }
        });
    });

    describe('форма и заливка', (): void => {
        it('SC-UKV-185 — без входов — полностью скруглённая сплошная пилюля', (): void => {
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
        it('SC-UKV-186 — без входа модификатора скругления нет — радиус берётся из формы', (): void => {
            expect(pillClasses(setup()).some((cls: string): boolean => cls.startsWith('rt-tag--radius'))).toBe(false);
        });

        it.each<IRtTag.Radius>(['none', 'sm', 'md', 'lg', 'full'])('заданный шаг %s перебивает форму', (radius: IRtTag.Radius): void => {
            expect(pillClasses(setup({ radius, shape: 'pill' }))).toContain(`rt-tag--radius--${radius}`);
        });
    });

    describe('иконки', (): void => {
        it('SC-UKV-187 — без входов иконок нет', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup();

            expect(el(fixture, '.rt-tag__icon')).toBeNull();
            expect(el(fixture, '.rt-tag__icon-end')).toBeNull();
        });

        it('SC-UKV-188 — префикс-иконка рисуется перед текстом', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ icon: 'check' });

            expect(el(fixture, '.rt-tag__icon use')?.attributes['href']).toBe('#rt-icon-check');
        });

        it('SC-UKV-188 — суффикс-иконка рисуется после текста', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ iconEnd: 'ico-close' });

            expect(el(fixture, '.rt-tag__icon-end use')?.attributes['href']).toBe('#rt-icon-ico-close');
        });

        it('SC-UKV-188 — обе иконки уживаются вместе', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ icon: 'check', iconEnd: 'ico-close' });

            expect(el(fixture, '.rt-tag__icon')).not.toBeNull();
            expect(el(fixture, '.rt-tag__icon-end')).not.toBeNull();
        });
    });

    describe('крестик', (): void => {
        it('SC-UKV-189 — без входа крестика нет', (): void => {
            expect(qa(setup(), 'tag-close')).toBeNull();
        });

        it('SC-UKV-190 — появляется по входу и помечает пилюлю модификатором', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ closable: true });

            expect(qa(fixture, 'tag-close')).not.toBeNull();
            expect(pillClasses(fixture)).toContain('rt-tag--closable');
        });

        it('SC-UKV-191 — клик по крестику поднимает событие с исходным MouseEvent', (): void => {
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

        it('SC-UKV-192 — клик по крестику не всплывает наружу — пилюля целиком часто сама кликабельна', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ closable: true });
            const outer: jest.Mock = jest.fn();
            (fixture.nativeElement as HTMLElement).parentElement?.addEventListener('click', outer);

            const control: DebugElement | null = el(fixture, '[qa-dataid="tag-close"] [qa-dataid="icon-button-control"]');
            control?.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(outer).not.toHaveBeenCalled();
        });

        it('SC-UKV-193 — крестик подписан переведённой подписью, а не ключом', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ closable: true });

            const control: DebugElement | null = el(fixture, '[qa-dataid="tag-close"] [qa-dataid="icon-button-control"]');

            expect(control?.attributes['aria-label']).toBe('Delete');
        });
    });
});

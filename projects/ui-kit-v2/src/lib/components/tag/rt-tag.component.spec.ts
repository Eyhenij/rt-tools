import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { classesOf, createRtFixture, el, hostClasses, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
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

    describe('усечение подписи', (): void => {
        // Раскладки в спеке нет, и ширины у узла нулевые: переполнение подменяется замером — так
        // же, как это делает соседний `rt-collapsible-text`.
        function overflow(fixture: ComponentFixture<RtTagComponent>, scroll: number, client: number): void {
            const node: HTMLElement = qa(fixture, 'tag-text')?.nativeElement as HTMLElement;

            Object.defineProperty(node, 'scrollWidth', { configurable: true, value: scroll });
            Object.defineProperty(node, 'clientWidth', { configurable: true, value: client });
            setInputs(fixture, { value: `${fixture.componentInstance.value()} ` });
            fixture.detectChanges();
            TestBed.tick();
        }

        it('SC-UKV-197 — подписи хватило места: подсказки нет', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ value: 'Активен' });

            overflow(fixture, 80, 80);

            expect(fixture.debugElement.query(By.directive(RtTooltipDirective))?.injector.get(RtTooltipDirective).text()).toBe('');
        });

        it('SC-UKV-198 — подписи не хватило места: подсказка несёт целое значение', (): void => {
            const fixture: ComponentFixture<RtTagComponent> = setup({ value: 'Ожидает подтверждения оплаты' });

            overflow(fixture, 400, 80);

            expect(fixture.debugElement.query(By.directive(RtTooltipDirective))?.injector.get(RtTooltipDirective).text()).toBe(
                fixture.componentInstance.value()
            );
        });
    });

    describe('заливка', (): void => {
        it('SC-UKV-185 — без входов — сплошная пилюля', (): void => {
            expect(pillClasses(setup())).toContain('rt-tag--appearance--solid');
        });

        it.each<IRtTag.Appearance>(['solid', 'outlined'])('заливка %s даёт свой модификатор', (appearance: IRtTag.Appearance): void => {
            expect(pillClasses(setup({ appearance }))).toContain(`rt-tag--appearance--${appearance}`);
        });
    });

    describe('скругление', (): void => {
        it('SC-UKV-391 — без входа шага нет, названный шаг ложится на хост', (): void => {
            const plain: ComponentFixture<RtTagComponent> = setup();
            const square: ComponentFixture<RtTagComponent> = setup({ radius: 'sm' });

            expect(plain.nativeElement.hasAttribute('data-rt-radius')).toBe(false);
            expect(square.nativeElement.getAttribute('data-rt-radius')).toBe('sm');
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

    it('SC-UKV-667 — слова поиска отмечены в подписи, а пустой ввод не отмечает ничего', (): void => {
        const fixture: ComponentFixture<RtTagComponent> = setup({ value: 'Москва Центр', highlight: 'моск цен' });
        const matched: () => string[] = (): string[] =>
            Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.rt-tag__part--match')).map(
                (part: Element): string => part.textContent ?? ''
            );

        expect(matched()).toEqual(['Моск', 'Цен']);
        expect(textOf(qa(fixture, 'tag-text'))).toBe('Москва Центр');

        setInputs(fixture, { highlight: '' });
        fixture.detectChanges();
        expect(matched()).toEqual([]);
    });
});

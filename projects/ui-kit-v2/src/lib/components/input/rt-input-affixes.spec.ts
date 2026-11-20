import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtInputComponent } from './rt-input.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtInputComponent> {
    return createRtFixture(RtInputComponent, inputs);
}

function field(fixture: ComponentFixture<RtInputComponent>): HTMLInputElement {
    return qa(fixture, 'input-control')?.nativeElement as HTMLInputElement;
}

function type(fixture: ComponentFixture<RtInputComponent>, text: string): void {
    const node: HTMLInputElement = field(fixture);
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

describe('RtInputComponent — постоянный текст до и после значения', (): void => {
    it('SC-UKV-1541 — приставка стоит перед полем и в значение не входит', (): void => {
        const fixture: ComponentFixture<RtInputComponent> = setup({ prefix: 'site.ru/team/' });
        const changes: string[] = [];
        fixture.componentInstance.registerOnChange((value: string): void => {
            changes.push(value);
        });

        type(fixture, 'my-page');

        const prefix: HTMLElement = qa(fixture, 'input-prefix')?.nativeElement as HTMLElement;
        expect(textOf(prefix)).toBe('site.ru/team/');
        expect(prefix.nextElementSibling?.contains(field(fixture))).toBe(true);
        expect(changes).toEqual(['my-page']);
        expect(hostClasses(fixture)).toContain('rt-input--with-prefix');
    });

    it('SC-UKV-1542 — суффикс идёт следом за значением, а ширину полю задаёт копия набранного', (): void => {
        const fixture: ComponentFixture<RtInputComponent> = setup({ suffix: '.site.ru', placeholder: 'имя-команды' });
        const sizer: HTMLElement = el(fixture, '.rt-input__sizer')?.nativeElement as HTMLElement;
        const changes: string[] = [];
        fixture.componentInstance.registerOnChange((value: string): void => {
            changes.push(value);
        });

        expect(textOf(sizer)).toBe('имя-команды');

        type(fixture, 'my-team');

        const suffix: HTMLElement = qa(fixture, 'input-suffix')?.nativeElement as HTMLElement;
        expect(textOf(suffix)).toBe('.site.ru');
        expect(suffix.previousElementSibling?.contains(field(fixture))).toBe(true);
        expect(textOf(sizer)).toBe('my-team');
        expect(changes).toEqual(['my-team']);
        expect(hostClasses(fixture)).toContain('rt-input--with-suffix');
    });

    it('SC-UKV-1543 — без входов поле прежнее: ни текста, ни копии, ни описания', (): void => {
        const fixture: ComponentFixture<RtInputComponent> = setup();

        expect(qa(fixture, 'input-control')).not.toBeNull();
        expect(qa(fixture, 'input-prefix')).toBeNull();
        expect(qa(fixture, 'input-suffix')).toBeNull();
        expect(el(fixture, '.rt-input__sizer')).toBeNull();
        expect(field(fixture).getAttribute('aria-describedby')).toBeNull();
    });

    it('SC-UKV-1544 — поле описано своим постоянным текстом, и диктор читает адрес целиком', (): void => {
        const fixture: ComponentFixture<RtInputComponent> = setup({ prefix: 'site.ru/', suffix: '.html' });
        const prefix: HTMLElement = qa(fixture, 'input-prefix')?.nativeElement as HTMLElement;
        const suffix: HTMLElement = qa(fixture, 'input-suffix')?.nativeElement as HTMLElement;

        expect(field(fixture).getAttribute('aria-describedby')).toBe(`${prefix.id} ${suffix.id}`);
        expect(prefix.getAttribute('aria-hidden')).toBe('true');
        expect(suffix.getAttribute('aria-hidden')).toBe('true');
    });

    it('SC-UKV-1548 — подпись на рамке у пустого поля с постоянным текстом поднята и не ложится на него', (): void => {
        const plain: ComponentFixture<RtInputComponent> = setup({ floatingLabel: 'Адрес' });
        const withPrefix: ComponentFixture<RtInputComponent> = setup({ floatingLabel: 'Адрес', prefix: 'site.ru/' });
        const withSuffix: ComponentFixture<RtInputComponent> = setup({ floatingLabel: 'Команда', suffix: '.site.ru' });

        expect(hostClasses(plain)).not.toContain('rt-input--label-raised');
        expect(hostClasses(withPrefix)).toContain('rt-input--label-raised');
        expect(hostClasses(withSuffix)).toContain('rt-input--label-raised');
        expect(hostClasses(withPrefix)).not.toContain('rt-input--filled');
    });

    it('SC-UKV-1549 — у скрытого пароля с суффиксом копия меряет точки, а не знаки', (): void => {
        const fixture: ComponentFixture<RtInputComponent> = setup({ type: 'password', suffix: '!' });
        type(fixture, 'пароль');

        expect(textOf(el(fixture, '.rt-input__sizer'))).toBe('••••••');
    });

    it('SC-UKV-1550 — нажатие на суффикс ставит курсор в конец значения, на приставку — в начало', (): void => {
        const fixture: ComponentFixture<RtInputComponent> = setup({ prefix: 'site.ru/', suffix: '.html' });
        type(fixture, 'page');
        const node: HTMLInputElement = field(fixture);
        node.setSelectionRange(2, 2);

        (qa(fixture, 'input-suffix')?.nativeElement as HTMLElement).dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect([node.selectionStart, node.selectionEnd]).toEqual([4, 4]);

        (qa(fixture, 'input-prefix')?.nativeElement as HTMLElement).dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect([node.selectionStart, node.selectionEnd]).toEqual([0, 0]);
    });

    it('SC-UKV-1545 — только для чтения значение показано с постоянным текстом, пустое — прочерком', (): void => {
        const fixture: ComponentFixture<RtInputComponent> = setup({ prefix: 'site.ru/team/', suffix: '/' });
        type(fixture, 'my-page');

        fixture.componentInstance.setReadonly(true);
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'input-readonly'))).toBe('site.ru/team/my-page/');

        fixture.componentInstance.writeValue('');
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'input-readonly'))).toBe('—');
    });
});

import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, qa } from '../../../testing/rt-kit-testing';
import { IRtSplitButton } from './rt-split-button.model';
import { RtSplitButtonComponent } from './rt-split-button.component';

const ITEMS: ReadonlyArray<IRtSplitButton.MenuItem> = [
    { value: 'draft', label: 'Сохранить черновик' },
    { value: 'copy', label: 'Дублировать', icon: 'ico-copy' },
    { value: 'archive', label: 'В архив', disabled: true },
];

/** Меню живёт в оверлее CDK — ищем его в документе. */
function menu(): HTMLElement | null {
    return document.querySelector('[qa-dataid="split-button-menu"]');
}

function menuItems(): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll('[qa-dataid="split-button-menu-item"]'));
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtSplitButtonComponent> {
    return createRtFixture(RtSplitButtonComponent, { label: 'Сохранить', menuItems: ITEMS, ...inputs });
}

function face(fixture: ComponentFixture<RtSplitButtonComponent>): HTMLButtonElement {
    return qa(fixture, 'split-button-face')?.nativeElement as HTMLButtonElement;
}

function caret(fixture: ComponentFixture<RtSplitButtonComponent>): HTMLButtonElement {
    return qa(fixture, 'split-button-toggle')?.nativeElement as HTMLButtonElement;
}

function openMenu(fixture: ComponentFixture<RtSplitButtonComponent>): void {
    caret(fixture).click();
    fixture.detectChanges();
}

describe('RtSplitButtonComponent', (): void => {
    it('рисует основную кнопку с подписью и каретку рядом', (): void => {
        const fixture: ComponentFixture<RtSplitButtonComponent> = setup();

        expect(face(fixture).getAttribute('aria-label')).toBe('Сохранить');
        expect(caret(fixture)).not.toBeNull();
    });

    it('до нажатия каретки меню нет', (): void => {
        setup();

        expect(menu()).toBeNull();
    });

    describe('основное действие', (): void => {
        it('нажатие поднимает своё событие и меню не открывает', (): void => {
            const fixture: ComponentFixture<RtSplitButtonComponent> = setup();
            const clicks: jest.Mock = jest.fn();
            fixture.componentInstance.faceClick.subscribe(clicks);

            face(fixture).click();
            fixture.detectChanges();

            expect(clicks).toHaveBeenCalledTimes(1);
            expect(menu()).toBeNull();
        });

        it('во время загрузки нажатие не проходит', (): void => {
            const fixture: ComponentFixture<RtSplitButtonComponent> = setup({ loading: true });
            const clicks: jest.Mock = jest.fn();
            fixture.componentInstance.faceClick.subscribe(clicks);

            face(fixture).dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(clicks).not.toHaveBeenCalled();
        });
    });

    describe('меню', (): void => {
        it('каретка раскрывает список действий', (): void => {
            const fixture: ComponentFixture<RtSplitButtonComponent> = setup();

            openMenu(fixture);

            expect(menu()?.getAttribute('role')).toBe('menu');
            expect(menuItems().length).toBe(3);
        });

        it('повторное нажатие каретки закрывает', (): void => {
            const fixture: ComponentFixture<RtSplitButtonComponent> = setup();

            openMenu(fixture);
            openMenu(fixture);

            expect(menu()).toBeNull();
        });

        it('выбор пункта закрывает меню и сообщает его значение', (): void => {
            const fixture: ComponentFixture<RtSplitButtonComponent> = setup();
            const picked: string[] = [];
            fixture.componentInstance.itemSelect.subscribe((value: string): void => {
                picked.push(value);
            });
            openMenu(fixture);

            menuItems()[1].click();
            fixture.detectChanges();

            expect(picked).toEqual(['copy']);
            expect(menu()).toBeNull();
        });

        it('отключённый пункт не выбирается и меню не закрывает', (): void => {
            const fixture: ComponentFixture<RtSplitButtonComponent> = setup();
            const picked: jest.Mock = jest.fn();
            fixture.componentInstance.itemSelect.subscribe(picked);
            openMenu(fixture);

            menuItems()[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(picked).not.toHaveBeenCalled();
            expect(menu()).not.toBeNull();
        });

        it('каретка отключена вместе с кнопкой и во время загрузки', (): void => {
            expect(caret(setup({ disabled: true })).disabled).toBe(true);
            expect(caret(setup({ loading: true })).disabled).toBe(true);
        });

        it('значение пункта продублировано атрибутом данных', (): void => {
            const fixture: ComponentFixture<RtSplitButtonComponent> = setup();

            openMenu(fixture);

            expect(menuItems()[0].getAttribute('data-value')).toBe('draft');
        });
    });

    describe('подпись каретки', (): void => {
        it('без входа берётся из словаря кита', (): void => {
            expect(caret(setup()).getAttribute('aria-label')).toBe('More actions');
        });

        it('своя подпись перебивает умолчание', (): void => {
            expect(caret(setup({ menuAriaLabel: 'Другие действия' })).getAttribute('aria-label')).toBe('Другие действия');
        });
    });

    it('состояние загрузки отдаётся основной кнопке', (): void => {
        const fixture: ComponentFixture<RtSplitButtonComponent> = setup({ loading: true });

        expect(el(fixture, '.rt-button--loading')).not.toBeNull();
    });
});

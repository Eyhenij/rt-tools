import { Clipboard } from '@angular/cdk/clipboard';
import { ComponentFixture } from '@angular/core/testing';

import { By } from '@angular/platform-browser';

import { RtIconComponent } from '../icon/rt-icon.component';

import { createRtFixture, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtCopyValueComponent } from './rt-copy-value.component';

/** Двойник буфера: настоящий в среде без браузера ничего не кладёт и молчит об этом. */
class ClipboardDouble {
    public readonly copied: string[] = [];

    public copy(text: string): boolean {
        this.copied.push(text);

        return true;
    }
}

let clipboard: ClipboardDouble;

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtCopyValueComponent> {
    clipboard = new ClipboardDouble();

    return createRtFixture(
        RtCopyValueComponent,
        { value: 'a1b2c3d4', ...inputs },
        { providers: [{ provide: Clipboard, useValue: clipboard }] }
    );
}

/** Имя кнопки — оно же текст подсказки. */
function buttonName(fixture: ComponentFixture<RtCopyValueComponent>): string | null {
    return (qa(fixture, 'copy-value-button')?.nativeElement.querySelector('button') as HTMLButtonElement).getAttribute('aria-label');
}

/** Имя значка внутри кнопки. */
function iconName(fixture: ComponentFixture<RtCopyValueComponent>): string | null {
    return fixture.debugElement.query(By.directive(RtIconComponent)).componentInstance.name();
}

function press(fixture: ComponentFixture<RtCopyValueComponent>): void {
    (qa(fixture, 'copy-value-button')?.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
}

describe('RtCopyValueComponent', (): void => {
    afterEach((): void => {
        jest.useRealTimers();
    });

    it('несёт свой BEM-блок на host-е', (): void => {
        expect(hostClasses(setup())).toContain('rt-copy-value');
    });

    it('SC-UKV-742 — значение стоит на подложке, подпись слева рисуется только заданной', (): void => {
        const plain: ComponentFixture<RtCopyValueComponent> = setup();

        expect(textOf(qa(plain, 'copy-value-value'))).toBe('a1b2c3d4');
        expect(qa(plain, 'copy-value-label')).toBeNull();
        expect(textOf(qa(setup({ label: 'Reference' }), 'copy-value-label'))).toBe('Reference');
    });

    it('SC-UKV-743 — нажатие кладёт значение в буфер и сообщает наружу', (): void => {
        const fixture: ComponentFixture<RtCopyValueComponent> = setup();
        const seen: string[] = [];
        fixture.componentInstance.copiedValue.subscribe((value: string): number => seen.push(value));

        press(fixture);

        expect(clipboard.copied).toEqual(['a1b2c3d4']);
        expect(seen).toEqual(['a1b2c3d4']);
    });

    it('SC-UKV-744 — после копирования подпись «Copied» и галочка, через две секунды — снова «Copy»', (): void => {
        jest.useFakeTimers();
        const fixture: ComponentFixture<RtCopyValueComponent> = setup();

        press(fixture);
        expect(buttonName(fixture)).toBe('Copied');
        expect(iconName(fixture)).toBe('check');

        jest.advanceTimersByTime(2000);
        fixture.detectChanges();

        expect(buttonName(fixture)).toBe('Copy');
        expect(iconName(fixture)).toBe('copy');
    });

    it('SC-UKV-745 — своя подпись кнопки перебивает переведённую', (): void => {
        expect(buttonName(setup({ copyLabel: 'Copy reference' }))).toBe('Copy reference');
    });

    it('SC-UKV-746 — кнопка стоит после значения отдельным узлом, значение сжимается без неё', (): void => {
        const fixture: ComponentFixture<RtCopyValueComponent> = setup({ value: '8f3c2a91-4d7e-4b5a-9f21-0c6e3d7a1b44' });
        const value: HTMLElement = qa(fixture, 'copy-value-value')?.nativeElement;

        expect(value.nextElementSibling).toBe(qa(fixture, 'copy-value-button')?.nativeElement);
        expect(value.contains(qa(fixture, 'copy-value-button')?.nativeElement)).toBe(false);
    });
});

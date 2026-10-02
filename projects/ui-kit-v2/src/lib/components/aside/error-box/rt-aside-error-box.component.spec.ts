import { Clipboard } from '@angular/cdk/clipboard';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, textOf } from '../../../../testing/rt-kit-testing';
import { RtAsideErrorBoxComponent } from './rt-aside-error-box.component';

/** Двойник буфера: настоящий в среде без браузера ничего не кладёт и молчит об этом. */
class ClipboardDouble {
    public readonly copied: string[] = [];

    public copy(text: string): boolean {
        this.copied.push(text);

        return true;
    }
}

let clipboard: ClipboardDouble;

function setup(error: unknown): ComponentFixture<RtAsideErrorBoxComponent> {
    clipboard = new ClipboardDouble();

    return createRtFixture(RtAsideErrorBoxComponent, { error }, { providers: [{ provide: Clipboard, useValue: clipboard }] });
}

function press(fixture: ComponentFixture<RtAsideErrorBoxComponent>): void {
    (qa(fixture, 'aside-error-copy')?.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
}

function buttonText(fixture: ComponentFixture<RtAsideErrorBoxComponent>): string {
    return textOf(qa(fixture, 'aside-error-copy'));
}

describe('RtAsideErrorBoxComponent', (): void => {
    // Возврат к настоящим таймерам — в afterEach: упавшее утверждение посреди теста иначе оставило
    // бы поддельные таймеры следующим тестам файла.
    afterEach((): void => {
        jest.useRealTimers();
    });

    it('показывает надпись и кнопку копирования', (): void => {
        const fixture: ComponentFixture<RtAsideErrorBoxComponent> = setup({ status: 500 });

        expect(textOf(qa(fixture, 'aside-error-title'))).toBe('Request Error');
        expect(buttonText(fixture)).toBe('Copy error info');
    });

    it('SC-UKV-466: нажатие копирует ошибку и секунду подтверждает копирование', (): void => {
        jest.useFakeTimers();
        const fixture: ComponentFixture<RtAsideErrorBoxComponent> = setup({ status: 500 });

        press(fixture);

        expect(clipboard.copied).toHaveLength(1);
        expect(clipboard.copied[0]).toMatch(/^Error time: .+;Error info: \{"status":500\}$/);
        expect(buttonText(fixture)).toBe('Copied');

        jest.advanceTimersByTime(999);
        fixture.detectChanges();
        expect(buttonText(fixture)).toBe('Copied');

        jest.advanceTimersByTime(1);
        fixture.detectChanges();
        expect(buttonText(fixture)).toBe('Copy error info');
    });

    it('SC-UKV-466: второе нажатие внутри секунды копирует снова и начинает секунду заново', (): void => {
        jest.useFakeTimers();
        const fixture: ComponentFixture<RtAsideErrorBoxComponent> = setup('Timeout');

        press(fixture);
        jest.advanceTimersByTime(600);
        press(fixture);
        jest.advanceTimersByTime(600);
        fixture.detectChanges();

        expect(clipboard.copied).toHaveLength(2);
        expect(buttonText(fixture)).toBe('Copied');

        jest.advanceTimersByTime(400);
        fixture.detectChanges();
        expect(buttonText(fixture)).toBe('Copy error info');
    });
});

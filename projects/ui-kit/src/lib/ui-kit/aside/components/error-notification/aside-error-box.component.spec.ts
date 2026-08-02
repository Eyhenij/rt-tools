import { Clipboard } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideErrorBoxComponent } from './aside-error-box.component';

interface IClipboardStub {
    copy: jest.Mock<boolean, [string]>;
}

function setup(error: unknown): { fixture: ComponentFixture<AsideErrorBoxComponent>; clipboard: IClipboardStub } {
    const clipboard: IClipboardStub = { copy: jest.fn<boolean, [string]>().mockReturnValue(true) };

    TestBed.configureTestingModule({
        imports: [AsideErrorBoxComponent],
        providers: [{ provide: Clipboard, useValue: clipboard }],
    });

    const fixture: ComponentFixture<AsideErrorBoxComponent> = TestBed.createComponent(AsideErrorBoxComponent);
    fixture.componentRef.setInput('error', error);
    fixture.detectChanges();

    return { fixture, clipboard };
}

function copiedPayload(clipboard: IClipboardStub): string {
    return clipboard.copy.mock.calls[0][0];
}

describe('AsideErrorBoxComponent', () => {
    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('serialises a plain object failure — the input is not bound to any transport', () => {
        const failure: object = { code: 'NOT_FOUND', status: 404 };
        const { fixture, clipboard }: { fixture: ComponentFixture<AsideErrorBoxComponent>; clipboard: IClipboardStub } = setup(failure);

        fixture.componentInstance.onCopyToClipboard();

        expect(clipboard.copy).toHaveBeenCalledTimes(1);
        expect(copiedPayload(clipboard)).toContain(JSON.stringify(failure));
    });

    it('accepts a primitive failure', () => {
        const { fixture, clipboard }: { fixture: ComponentFixture<AsideErrorBoxComponent>; clipboard: IClipboardStub } =
            setup('connection lost');

        fixture.componentInstance.onCopyToClipboard();

        expect(copiedPayload(clipboard)).toContain('"connection lost"');
    });

    it('accepts a null failure', () => {
        const { fixture, clipboard }: { fixture: ComponentFixture<AsideErrorBoxComponent>; clipboard: IClipboardStub } = setup(null);

        fixture.componentInstance.onCopyToClipboard();

        expect(copiedPayload(clipboard)).toContain('null');
    });

    it('flags the copy as complete and resets it after a second', () => {
        jest.useFakeTimers();

        const { fixture }: { fixture: ComponentFixture<AsideErrorBoxComponent>; clipboard: IClipboardStub } = setup({ message: 'boom' });

        fixture.componentInstance.onCopyToClipboard();
        expect(fixture.componentInstance.isErrorCopied()).toBe(true);

        jest.advanceTimersByTime(1000);
        expect(fixture.componentInstance.isErrorCopied()).toBe(false);

        jest.useRealTimers();
    });
});

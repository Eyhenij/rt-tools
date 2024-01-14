import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { WINDOW } from './window.token';


describe('WINDOW', () => {
    describe('when window object is available', () => {
        const window: Window = ({} as unknown) as Window;
        const documentRef: any = {
            defaultView: window
        };
        let injectedWindow: Window;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [{ provide: DOCUMENT, useValue: documentRef }]
            });

            injectedWindow = TestBed.inject(WINDOW);
        });

        it('should return defaultView property of document object', () => {
            expect(injectedWindow).toBe(window);
        });
    });

    describe('when window object is not available', () => {
        const documentRef: any = {};

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [{ provide: DOCUMENT, useValue: documentRef }]
            });
        });

        it('should throw error', () => {
            expect(() => TestBed.inject(WINDOW)).toThrow();
        });
    });
});

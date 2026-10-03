import { InteractivityChecker } from '@angular/cdk/a11y';
import { ApplicationRef, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { firstValueFrom } from 'rxjs';

import { createRtFixture, hostClasses, provideRtKitTesting, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtDialogContentComponent } from './content/rt-dialog-content.component';
import { TRtDialogFooterAlign, RtDialogFooterComponent } from './footer/rt-dialog-footer.component';
import { RtDialogHeaderComponent } from './header/rt-dialog-header.component';
import { RtDialogRef } from './rt-dialog-ref';
import { TRtDialogSize, RtDialogComponent } from './rt-dialog.component';
import { RtDialogService } from './rt-dialog.service';
import { RT_DIALOG_DATA } from './rt-dialog.tokens';

/** Компонент, который сервис поднимает в оверлее. */
@Component({
    selector: 'rt-dialog-test-content',
    template: `
        <rt-dialog [ariaLabel]="'Подтверждение'">
            <rt-dialog-header title="Удаление" />
            <p qa-dataid="dialog-body">{{ data }}</p>
            <rt-dialog-footer>
                <button type="button" qa-dataid="dialog-accept" (click)="accept()">Да</button>
            </rt-dialog-footer>
        </rt-dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDialogComponent, RtDialogHeaderComponent, RtDialogFooterComponent],
})
class DialogContentComponent {
    public readonly data: string = inject(RT_DIALOG_DATA) as string;
    readonly #ref: RtDialogRef<boolean> = inject(RtDialogRef);

    public accept(): void {
        this.#ref.close(true);
    }
}

function panel(): HTMLElement | null {
    return document.querySelector('[qa-dataid="dialog"]');
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

function backdrop(): HTMLElement | null {
    return document.querySelector('.rt-dialog-backdrop');
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtDialogComponent> {
    return createRtFixture(RtDialogComponent, inputs);
}

describe('RtDialogComponent', (): void => {
    it('объявлен модальным диалогом', (): void => {
        const fixture: ComponentFixture<RtDialogComponent> = setup();
        const dialog: HTMLElement = qa(fixture, 'dialog')?.nativeElement as HTMLElement;

        expect(dialog.getAttribute('role')).toBe('dialog');
        expect(dialog.getAttribute('aria-modal')).toBe('true');
    });

    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-dialog');
    });

    it.each<TRtDialogSize>(['sm', 'md', 'lg'])('размер %s выводит модификатор', (size: TRtDialogSize): void => {
        const fixture: ComponentFixture<RtDialogComponent> = setup({ size });

        expect(Array.from((qa(fixture, 'dialog')?.nativeElement as HTMLElement).classList)).toContain(`rt-dialog--size--${size}`);
    });

    it('произвольная ширина едет свойством оформления, а не классом', (): void => {
        // Так диалог подгоняют под содержимое, не заводя новый размер в шкале.
        const fixture: ComponentFixture<RtDialogComponent> = setup({ width: '360px' });

        expect((fixture.nativeElement as HTMLElement).style.getPropertyValue('--rt-dialog-width')).toBe('360px');
    });

    it('подпись для скринридера задаётся входом', (): void => {
        const fixture: ComponentFixture<RtDialogComponent> = setup({ ariaLabel: 'Подтверждение' });

        expect((qa(fixture, 'dialog')?.nativeElement as HTMLElement).getAttribute('aria-label')).toBe('Подтверждение');
    });
});

describe('RtDialogService', (): void => {
    function service(): RtDialogService {
        TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
        return TestBed.inject(RtDialogService);
    }

    /**
     * Диалог живёт в оверлее, а не в фикстуре: своей отрисовки у него нет.
     * Прогоняем её вручную через ApplicationRef — иначе разметка остаётся пустой.
     */
    function render(): void {
        TestBed.inject(ApplicationRef).tick();
    }

    it('поднимает компонент в оверлее с подложкой', (): void => {
        service().open(DialogContentComponent, { data: 'Удалить запись?' });
        render();

        expect(panel()).not.toBeNull();
        expect(backdrop()).not.toBeNull();
    });

    it('переданные данные доезжают до содержимого', (): void => {
        // Данные приходят токеном, а не входом: компонент создаётся вручную.
        service().open(DialogContentComponent, { data: 'Удалить запись?' });
        render();

        expect(node('dialog-body')?.textContent?.trim()).toBe('Удалить запись?');
    });

    it('закрытие отдаёт результат и убирает диалог', async (): Promise<void> => {
        const ref: RtDialogRef<boolean> = service().open<DialogContentComponent, string, boolean>(DialogContentComponent, {
            data: 'Удалить?',
        });
        const closed: Promise<boolean | undefined> = firstValueFrom(ref.afterClosed());
        render();

        node('dialog-accept')?.click();

        await expect(closed).resolves.toBe(true);
        expect(panel()).toBeNull();
    });

    it('крестик в шапке закрывает диалог без результата', async (): Promise<void> => {
        const ref: RtDialogRef<boolean> = service().open<DialogContentComponent, string, boolean>(DialogContentComponent, { data: '…' });
        const closed: Promise<boolean | undefined> = firstValueFrom(ref.afterClosed());
        render();

        (document.querySelector('[qa-dataid="dialog-close"] [qa-dataid="icon-button-control"]') as HTMLButtonElement).click();

        await expect(closed).resolves.toBeUndefined();
    });

    it('клик по подложке закрывает диалог', (): void => {
        service().open(DialogContentComponent, { data: '…' });
        render();

        backdrop()?.click();

        expect(panel()).toBeNull();
    });

    it('подложку можно сделать неактивной', (): void => {
        service().open(DialogContentComponent, { data: '…', closeOnBackdropClick: false });
        render();

        backdrop()?.click();

        expect(panel()).not.toBeNull();
    });

    it('Escape закрывает диалог', (): void => {
        service().open(DialogContentComponent, { data: '…' });
        render();

        panel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(panel()).toBeNull();
    });

    it('запрет закрытия держит диалог и под кликом, и под Escape', (): void => {
        // Флаг ставит сам диалог, когда в форме есть несохранённое.
        const ref: RtDialogRef = service().open(DialogContentComponent, { data: '…' });
        render();

        ref.disableClose.set(true);
        backdrop()?.click();
        panel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(panel()).not.toBeNull();
    });

    describe('фокус', (): void => {
        /**
         * У jsdom нет раскладки, и проверка видимости CDK считает невидимым всё подряд. Подменяем её:
         * доступен любой элемент, а по Tab — тот, у кого неотрицательный tabIndex.
         */
        function focusService(): RtDialogService {
            TestBed.configureTestingModule({
                providers: [
                    ...provideRtKitTesting(),
                    {
                        provide: InteractivityChecker,
                        useValue: {
                            isDisabled: (): boolean => false,
                            isVisible: (): boolean => true,
                            isFocusable: (element: HTMLElement): boolean => element.tabIndex >= -1,
                            isTabbable: (element: HTMLElement): boolean => element.tabIndex >= 0,
                        },
                    },
                ],
            });
            return TestBed.inject(RtDialogService);
        }

        function opener(): HTMLButtonElement {
            const button: HTMLButtonElement = document.createElement('button');
            button.setAttribute('qa-dataid', 'dialog-opener');
            document.body.appendChild(button);
            button.focus();
            return button;
        }

        afterEach((): void => {
            node('dialog-opener')?.remove();
        });

        it('SC-UKV-597 — без флагов фокус остаётся там, где был', (): void => {
            const button: HTMLButtonElement = opener();
            focusService().open(DialogContentComponent, { data: 'Удалить запись?' });
            render();

            expect(document.activeElement).toBe(button);
        });

        it('SC-UKV-596 — первый фокус встаёт на первый элемент под Tab', (): void => {
            opener();
            focusService().open(DialogContentComponent, { data: 'Удалить запись?', autoFocus: 'first-tabbable' });
            render();

            expect(document.activeElement).toBe(node('dialog-close')?.querySelector('button') ?? null);
        });

        it('SC-UKV-596 — первый фокус на рамке встаёт на само окно', (): void => {
            opener();
            focusService().open(DialogContentComponent, { data: 'Удалить запись?', autoFocus: 'dialog' });
            render();

            expect(document.activeElement).toBe(panel());
        });

        it('SC-UKV-594 — ловушка ставит границы фокуса вокруг окна и уходит вместе с ним', (): void => {
            opener();
            const ref: RtDialogRef = focusService().open(DialogContentComponent, { data: 'Удалить запись?', trapFocus: true });
            render();

            expect(document.querySelectorAll('.cdk-focus-trap-anchor').length).toBe(2);

            ref.close();
            render();

            expect(document.querySelectorAll('.cdk-focus-trap-anchor').length).toBe(0);
        });

        it('SC-UKV-595 — после закрытия фокус возвращается к открывшей кнопке', (): void => {
            const button: HTMLButtonElement = opener();
            const ref: RtDialogRef = focusService().open(DialogContentComponent, {
                data: 'Удалить запись?',
                autoFocus: 'first-tabbable',
                restoreFocus: true,
            });
            render();

            expect(document.activeElement).not.toBe(button);

            ref.close();
            render();

            expect(document.activeElement).toBe(button);
        });
    });

    describe('тема куска', (): void => {
        /** Кнопка, от которой открывают диалог: стоит в фокусе в момент открытия. */
        function focusButtonIn(markup: string): HTMLElement {
            const page: HTMLElement = document.createElement('div');
            page.innerHTML = markup;
            document.body.appendChild(page);
            (page.querySelector('button') as HTMLButtonElement).focus();
            return page;
        }

        afterEach((): void => {
            document.documentElement.removeAttribute('data-theme');
        });

        it('диалог, открытый кнопкой из тёмного куска, несёт тему куска на коробке', (): void => {
            const page: HTMLElement = focusButtonIn('<section data-theme="dark"><button type="button">Открыть</button></section>');

            service().open(DialogContentComponent, { data: '…' });
            render();

            expect(panel()?.closest('.cdk-overlay-pane')?.getAttribute('data-theme')).toBe('dark');
            page.remove();
        });

        it('тема корня страницы на коробку не копируется', (): void => {
            document.documentElement.setAttribute('data-theme', 'dark');
            const page: HTMLElement = focusButtonIn('<section><button type="button">Открыть</button></section>');

            service().open(DialogContentComponent, { data: '…' });
            render();

            const pane: Element | null | undefined = panel()?.closest('.cdk-overlay-pane');
            expect(pane).not.toBeNull();
            expect(pane?.hasAttribute('data-theme')).toBe(false);
            page.remove();
        });
    });
});

describe('RtDialogHeaderComponent', (): void => {
    it('рисует заголовок и крестик', (): void => {
        const fixture: ComponentFixture<RtDialogHeaderComponent> = createRtFixture(RtDialogHeaderComponent, { title: 'Удаление' });

        expect(textOf(qa(fixture, 'dialog-title'))).toBe('Удаление');
        expect(qa(fixture, 'dialog-close')).not.toBeNull();
    });

    it('крестик убирается входом — у шага мастера своя кнопка выхода', (): void => {
        const fixture: ComponentFixture<RtDialogHeaderComponent> = createRtFixture(RtDialogHeaderComponent, {
            title: 'Шаг 2',
            closable: false,
        });

        expect(qa(fixture, 'dialog-close')).toBeNull();
    });

    it('вне диалога крестик ничего не роняет — ссылки на диалог просто нет', (): void => {
        const fixture: ComponentFixture<RtDialogHeaderComponent> = createRtFixture(RtDialogHeaderComponent, { title: 'Заголовок' });

        expect((): void => {
            (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[qa-dataid="icon-button-control"]')?.click();
            fixture.detectChanges();
        }).not.toThrow();
    });
});

describe('части окна', (): void => {
    @Component({
        selector: 'rt-dialog-parts-host',
        template: `
            <rt-dialog>
                <rt-dialog-header title="Удаление">
                    <span rtDialogHeaderLead qa-dataid="lead-icon">!</span>
                </rt-dialog-header>
                <rt-dialog-content><p>Тело</p></rt-dialog-content>
                <rt-dialog-footer [align]="align"><button type="button">Да</button></rt-dialog-footer>
            </rt-dialog>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [RtDialogComponent, RtDialogHeaderComponent, RtDialogContentComponent, RtDialogFooterComponent],
    })
    class DialogPartsHostComponent {
        public align: TRtDialogFooterAlign = 'end';
    }

    function host(): ComponentFixture<DialogPartsHostComponent> {
        const fixture: ComponentFixture<DialogPartsHostComponent> = createRtFixture(DialogPartsHostComponent);
        fixture.detectChanges();
        return fixture;
    }

    it('SC-UKV-598 — элемент с меткой места встаёт перед заголовком', (): void => {
        const header: HTMLElement = qa(host(), 'dialog-header')?.nativeElement as HTMLElement;
        const lead: HTMLElement | null = header.querySelector('[qa-dataid="dialog-header-lead"]');

        expect(lead?.querySelector('[qa-dataid="lead-icon"]')).not.toBeNull();
        expect(lead?.nextElementSibling?.getAttribute('qa-dataid')).toBe('dialog-title');
    });

    it('SC-UKV-598 — без элемента место перед заголовком пустое', (): void => {
        const fixture: ComponentFixture<RtDialogHeaderComponent> = createRtFixture(RtDialogHeaderComponent, { title: 'Удаление' });

        expect((qa(fixture, 'dialog-header-lead')?.nativeElement as HTMLElement).childElementCount).toBe(0);
    });

    it.each<TRtDialogFooterAlign>(['start', 'center', 'end', 'between'])(
        'SC-UKV-599 — выравнивание подвала %s выводит модификатор',
        (align: TRtDialogFooterAlign): void => {
            const fixture: ComponentFixture<RtDialogFooterComponent> = createRtFixture(RtDialogFooterComponent, { align });

            expect(Array.from((qa(fixture, 'dialog-footer')?.nativeElement as HTMLElement).classList)).toContain(
                `rt-dialog-footer--align--${align}`
            );
        }
    );

    it('SC-UKV-599 — без входа подвал прижат к концу', (): void => {
        const footer: HTMLElement = qa(host(), 'dialog-footer')?.nativeElement as HTMLElement;

        expect(Array.from(footer.classList)).toContain('rt-dialog-footer--align--end');
    });

    it('SC-UKV-600 — тело окна проецирует содержимое в свой узел', (): void => {
        expect(textOf(qa(host(), 'dialog-content'))).toBe('Тело');
    });
});

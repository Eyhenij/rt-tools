import { ApplicationRef, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { firstValueFrom } from 'rxjs';

import { createRtFixture, hostClasses, provideRtKitTesting, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtDialogFooterComponent } from './footer/rt-dialog-footer.component';
import { RtDialogHeaderComponent } from './header/rt-dialog-header.component';
import { RtDialogRef } from './rt-dialog-ref';
import { IRtDialogSize, RtDialogComponent } from './rt-dialog.component';
import { RtDialogService } from './rt-dialog.service';
import { RT_DIALOG_DATA } from './rt-dialog.tokens';

/** Компонент, который сервис поднимает в оверлее. */
@Component({
    selector: 'rt-dialog-content',
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

    it.each<IRtDialogSize>(['sm', 'md', 'lg'])('размер %s выводит модификатор', (size: IRtDialogSize): void => {
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

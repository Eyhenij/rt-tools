import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { IRtMenu } from './rt-menu.model';
import { RT_DIALOG_DATA } from '../dialog/rt-dialog.tokens';
import { RtDialogRef } from '../dialog/rt-dialog-ref';
import { RtMenuConfirmDialogComponent } from './rt-menu-confirm-dialog.component';

/** Двойник ссылки на окно: спеке нужен исход, а не перекрытие CDK. */
class DialogRefDouble {
    public readonly closed: (boolean | undefined)[] = [];

    public close(result?: boolean): void {
        this.closed.push(result);
    }
}

const DATA: IRtMenu.ConfirmData = {
    message: 'Договор будет удалён без возможности вернуть.',
    title: 'Удалить договор?',
    confirmLabel: 'Удалить',
    cancelLabel: 'Оставить',
    tone: 'danger',
};

let dialogRef: DialogRefDouble;

function setup(data: IRtMenu.ConfirmData = DATA): ComponentFixture<RtMenuConfirmDialogComponent> {
    dialogRef = new DialogRefDouble();

    return createRtFixture(
        RtMenuConfirmDialogComponent,
        {},
        {
            providers: [
                { provide: RtDialogRef, useValue: dialogRef },
                { provide: RT_DIALOG_DATA, useValue: data },
            ],
        }
    );
}

describe('RtMenuConfirmDialogComponent', (): void => {
    it('показывает вопрос и заголовок, с которыми его открыли', (): void => {
        const fixture: ComponentFixture<RtMenuConfirmDialogComponent> = setup();

        expect(textOf(qa(fixture, 'menu-confirm-title'))).toBe('Удалить договор?');
        expect(textOf(qa(fixture, 'menu-confirm-message'))).toBe('Договор будет удалён без возможности вернуть.');
    });

    it('без заголовка остаётся один вопрос', (): void => {
        const fixture: ComponentFixture<RtMenuConfirmDialogComponent> = setup({ ...DATA, title: null });

        expect(qa(fixture, 'menu-confirm-title')).toBeNull();
        expect(textOf(qa(fixture, 'menu-confirm-message'))).not.toBe('');
    });

    it('подписи кнопок приходят из данных окна', (): void => {
        const fixture: ComponentFixture<RtMenuConfirmDialogComponent> = setup();

        expect(textOf(qa(fixture, 'menu-confirm-accept'))).toBe('Удалить');
        expect(textOf(qa(fixture, 'menu-confirm-cancel'))).toBe('Оставить');
    });

    it('согласие и отказ закрывают окно разными исходами', (): void => {
        // Порознь кнопки выглядят исправными: перепутанные исходы видны рядом.
        const fixture: ComponentFixture<RtMenuConfirmDialogComponent> = setup();

        (qa(fixture, 'menu-confirm-accept')?.nativeElement as HTMLElement).click();
        (qa(fixture, 'menu-confirm-cancel')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(dialogRef.closed).toEqual([true, false]);
    });

    it('палитра подтверждения приходит из данных окна', (): void => {
        expect(classesOf(qa(setup(), 'menu-confirm-accept'))).toContain('rt-button--danger');
        expect(classesOf(qa(setup({ ...DATA, tone: 'primary' }), 'menu-confirm-accept'))).not.toContain('rt-button--danger');
    });
});

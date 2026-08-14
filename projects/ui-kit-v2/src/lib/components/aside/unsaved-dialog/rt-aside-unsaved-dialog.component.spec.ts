import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, textOf } from '../../../../testing/rt-kit-testing';
import { ERtAsideUnsavedOutcome } from './rt-aside-unsaved.logic';
import { RtAsideUnsavedDialogComponent } from './rt-aside-unsaved-dialog.component';
import { RtDialogRef } from '../../dialog/rt-dialog-ref';

/** Двойник ссылки на окно: настоящая держит перекрытие CDK, а спеке нужен только исход. */
class DialogRefDouble {
    public readonly closed: (ERtAsideUnsavedOutcome | undefined)[] = [];

    public close(result?: ERtAsideUnsavedOutcome): void {
        this.closed.push(result);
    }
}

let dialogRef: DialogRefDouble;

function setup(): ComponentFixture<RtAsideUnsavedDialogComponent> {
    dialogRef = new DialogRefDouble();

    return createRtFixture(RtAsideUnsavedDialogComponent, {}, { providers: [{ provide: RtDialogRef, useValue: dialogRef }] });
}

function press(fixture: ComponentFixture<RtAsideUnsavedDialogComponent>, id: string): void {
    (qa(fixture, id)?.nativeElement as HTMLElement).click();
    fixture.detectChanges();
}

describe('RtAsideUnsavedDialogComponent', (): void => {
    it('спрашивает о несохранённых правках словами, а не одной кнопкой', (): void => {
        const fixture: ComponentFixture<RtAsideUnsavedDialogComponent> = setup();

        expect(textOf(qa(fixture, 'aside-unsaved-title'))).not.toBe('');
        expect(textOf(qa(fixture, 'aside-unsaved-message'))).not.toBe('');
    });

    it('три исхода различимы: уйти без сохранения, сохранить, остаться', (): void => {
        // Порознь каждая кнопка выглядит исправной: перепутанные исходы видны
        // только рядом.
        const fixture: ComponentFixture<RtAsideUnsavedDialogComponent> = setup();

        press(fixture, 'aside-unsaved-discard');
        press(fixture, 'aside-unsaved-save');
        press(fixture, 'aside-unsaved-stay');

        expect(dialogRef.closed).toEqual([ERtAsideUnsavedOutcome.Discard, ERtAsideUnsavedOutcome.Save, ERtAsideUnsavedOutcome.Stay]);
    });

    it('у каждой кнопки есть доступное имя — иначе исход слышен только зрячему', (): void => {
        const fixture: ComponentFixture<RtAsideUnsavedDialogComponent> = setup();

        for (const id of ['aside-unsaved-discard', 'aside-unsaved-save', 'aside-unsaved-stay']) {
            expect((qa(fixture, id)?.nativeElement as HTMLElement).getAttribute('aria-label')).not.toBe('');
        }
    });
});

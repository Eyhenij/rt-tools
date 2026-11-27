import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, textOf } from '../../../../testing/rt-kit-testing';
import { IRtSheetConfirmAnswers, RT_SHEET_CONFIRM_ANSWERS } from '../rt-bottom-sheet-confirm.answers';
import { IRtSheetConfirmLabels } from '../rt-bottom-sheet.model';
import { RtBottomSheetConfirmComponent } from './rt-bottom-sheet-confirm.component';

const LABELS: IRtSheetConfirmLabels = {
    title: 'Применить?',
    message: 'Выбор не применён',
    apply: 'Применить',
    discard: 'Не применять',
    stay: 'Остаться',
};

describe('RtBottomSheetConfirmComponent — экран вопроса шторки', (): void => {
    function setup(): { fixture: ComponentFixture<RtBottomSheetConfirmComponent>; said: string[] } {
        const said: string[] = [];
        const answers: IRtSheetConfirmAnswers = {
            apply: (): number => said.push('apply'),
            discard: (): number => said.push('discard'),
            stay: (): number => said.push('stay'),
        };
        const fixture: ComponentFixture<RtBottomSheetConfirmComponent> = createRtFixture(
            RtBottomSheetConfirmComponent,
            { labels: LABELS, titleId: 'sheet-confirm-title' },
            { providers: [{ provide: RT_SHEET_CONFIRM_ANSWERS, useValue: answers }] }
        );

        return { fixture, said };
    }

    it('SC-UKV-1785 — рисует слова вопроса, заголовок назван по titleId, фокус на «Применить»', (): void => {
        const { fixture } = setup();

        expect(textOf(qa(fixture, 'bottom-sheet-confirm-title'))).toBe('Применить?');
        const dialog: HTMLElement = qa(fixture, 'bottom-sheet-confirm')?.nativeElement as HTMLElement;
        expect(dialog.getAttribute('aria-labelledby')).toBe('sheet-confirm-title');
        expect(document.activeElement?.closest('[qa-dataid="bottom-sheet-confirm-apply"]')).not.toBeNull();
    });

    it('SC-UKV-1786 — каждый ответ уходит шторке своим именем', (): void => {
        const { fixture, said } = setup();

        for (const id of ['bottom-sheet-confirm-apply', 'bottom-sheet-confirm-discard', 'bottom-sheet-confirm-cancel']) {
            const node: HTMLElement = qa(fixture, id)?.nativeElement as HTMLElement;
            (node.querySelector('button') ?? node).click();
        }

        expect(said).toEqual(['apply', 'discard', 'stay']);
    });
});

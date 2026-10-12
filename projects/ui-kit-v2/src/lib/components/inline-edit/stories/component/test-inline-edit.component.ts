import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';

import { IRtInput } from '../../../input/rt-input.model';
import { RtInlineEditComponent } from '../../rt-inline-edit.component';
import { IRtInlineEdit } from '../../rt-inline-edit.model';

/** Сколько «приложение» витрины думает над сохранением в медленном случае. */
const SLOW_SAVE_MS: number = 1000;

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы, и играет роль приложения — сохраняет новое значение.
 * В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-inline-edit',
    templateUrl: './test-inline-edit.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtInlineEditComponent],
})
export class TestRtInlineEditComponent {
    readonly #cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    public value: string = 'Отчёт по продажам за май';
    public placeholder: string = 'Название отчёта';
    public look: IRtInlineEdit.Look = 'text';
    public truncate: IRtInlineEdit.Truncate = 'end';
    public size: IRtInput.Size = 'sm';
    public blurAction: IRtInlineEdit.BlurAction = 'keep';
    public allowEmpty: boolean = false;
    public slowSave: boolean = false;
    public disabled: boolean = false;

    public editing: boolean = false;
    public saving: boolean = false;

    public onSaved(next: string): void {
        if (!this.slowSave) {
            this.value = next;
            return;
        }
        this.saving = true;
        setTimeout((): void => {
            this.value = next;
            this.saving = false;
            this.editing = false;
            this.#cdr.markForCheck();
        }, SLOW_SAVE_MS);
    }
}

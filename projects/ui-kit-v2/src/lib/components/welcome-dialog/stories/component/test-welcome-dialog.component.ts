import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtDialogRef } from '../../../dialog/rt-dialog-ref';
import { RT_DIALOG_DATA } from '../../../dialog/rt-dialog.tokens';
import { IRtWelcomeDialog, RtWelcomeDialogComponent } from '../../rt-welcome-dialog.component';

/** Текст окна приходит одной строкой: первый абзац становится заголовком, остальные — текстом. */
const MESSAGE: string = [
    'Добро пожаловать',
    'Здесь собраны договоры вашей организации и всё, что к ним приложено.',
    'Настройки колонок и фильтры сохраняются между заходами.',
].join('\n\n');

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входов у окна нет вовсе — текст приходит данными открытия,
 * то есть внедрением, поэтому обёртка их и раздаёт. В пакет обёртка не уезжает.
 *
 * Ссылка на окно подменена: настоящая закрыла бы показ от первого же нажатия кнопки.
 */
@Component({
    selector: 'app-welcome-dialog',
    template: '<rt-welcome-dialog />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtWelcomeDialogComponent,
    ],
    providers: [
        { provide: RtDialogRef, useValue: { close: (): void => undefined } },
        { provide: RT_DIALOG_DATA, useValue: { message: MESSAGE } satisfies IRtWelcomeDialog.Data },
    ],
})
export class TestRtWelcomeDialogComponent {}

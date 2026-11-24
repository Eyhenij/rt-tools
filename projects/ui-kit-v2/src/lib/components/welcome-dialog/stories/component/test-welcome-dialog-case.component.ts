import { NgComponentOutlet } from '@angular/common';
import { inject, ChangeDetectionStrategy, Component, Injector, InputSignal, Signal, Type, computed, input } from '@angular/core';

import { RtDialogRef } from '../../../dialog/rt-dialog-ref';
import { RT_DIALOG_DATA } from '../../../dialog/rt-dialog.tokens';
import { IRtWelcomeDialog, RtWelcomeDialogComponent } from '../../rt-welcome-dialog.component';

/** Случай окна в ячейке матрицы. */
export type TWelcomeDialogCase = 'full' | 'title-only' | 'custom-cta' | 'empty';

/**
 * Ссылка на окно, ничего не закрывающая.
 *
 * Настоящая держит перекрытие CDK и на нажатие кнопки убрала бы окно из показа — ячейка
 * матрицы опустела бы прямо во время просмотра.
 */
const STORY_DIALOG_REF: Pick<RtDialogRef, 'close'> = { close: (): void => undefined };

/** Текст окна приходит одной строкой: первый абзац становится заголовком, остальные — текстом. */
const FULL_MESSAGE: string = [
    'Добро пожаловать',
    'Здесь собраны договоры вашей организации и всё, что к ним приложено.',
    'Настройки колонок и фильтры сохраняются между заходами.',
].join('\n\n');

/** Данные открытия в каждом случае. */
const CASE_DATA: Record<TWelcomeDialogCase, IRtWelcomeDialog.Data> = {
    full: { message: FULL_MESSAGE },
    'title-only': { message: 'Добро пожаловать' },
    'custom-cta': { message: FULL_MESSAGE, ctaLabel: 'Перейти к договорам' },
    empty: { message: '' },
};

/**
 * Одна ячейка матрицы `rt-welcome-dialog`: своё окно со своими данными открытия.
 *
 * **Входов у окна нет**: текст и подпись кнопки приходят внедрением, поэтому у каждой ячейки свой
 * инжектор, собранный по входу, — один инжектор на всю матрицу отдал бы всем ячейкам одно и то же.
 */
@Component({
    selector: 'app-welcome-dialog-case',
    templateUrl: './test-welcome-dialog-case.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgComponentOutlet],
})
export class TestRtWelcomeDialogCaseComponent {
    readonly #parent: Injector = inject(Injector);

    protected readonly dialog: Type<RtWelcomeDialogComponent> = RtWelcomeDialogComponent;

    protected readonly injector: Signal<Injector> = computed((): Injector =>
        Injector.create({
            parent: this.#parent,
            providers: [
                { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
                { provide: RT_DIALOG_DATA, useValue: CASE_DATA[this.kind()] },
            ],
        })
    );

    public readonly kind: InputSignal<TWelcomeDialogCase> = input.required<TWelcomeDialogCase>();
}

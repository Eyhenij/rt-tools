import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';

import { translateSignal, TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtButtonDirective } from '../button/rt-button.directive';
import { RtDialogRef } from '../dialog/rt-dialog-ref';
import { RtDialogComponent } from '../dialog/rt-dialog.component';
import { RT_DIALOG_DATA } from '../dialog/rt-dialog.tokens';

const BEM_BLOCK: string = 'rt-welcome-dialog';

/** Ключ подписи CTA по умолчанию: язык известен только после старта приложения */
const DEFAULT_CTA_KEY: string = 'rtKit.uiContinue';

export namespace IRtWelcomeDialog {
    /** Payload модалки: настраиваемый текст приветствия + подпись CTA-кнопки. */
    export interface Data {
        message: string;
        ctaLabel?: string;
    }
}

/**
 * Welcome-модалка первого входа: показывает настраиваемый текст приветствия роли.
 * Открывается программно через `RtDialogService.open(RtWelcomeDialogComponent, { data })`.
 *
 * Текст приходит многострочным: первый абзац (до пустой строки) рендерится
 * заголовком, остальные — параграфами описания. Без `rt-dialog-header` —
 * единственное действие закрытия — CTA-кнопка.
 */
@Component({
    selector: 'rt-welcome-dialog',
    templateUrl: './rt-welcome-dialog.component.html',
    styleUrl: './rt-welcome-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // standalone components / directives
        RtButtonDirective,
        RtDialogComponent,
        BlockDirective,
        ElemDirective,
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtWelcomeDialogComponent {
    readonly #dialogRef: RtDialogRef = inject(RtDialogRef);
    readonly #data: IRtWelcomeDialog.Data | null = inject<IRtWelcomeDialog.Data | null>(RT_DIALOG_DATA, { optional: true });

    readonly #defaultCtaLabel: Signal<string> = translateSignal(DEFAULT_CTA_KEY);

    protected readonly title: string;

    protected readonly paragraphs: string[];

    /** Своя подпись важнее умолчания: роль знает, куда ведёт кнопка */
    protected readonly ctaLabel: Signal<string> = computed((): string => this.#data?.ctaLabel || this.#defaultCtaLabel());

    constructor() {
        const parts: string[] = (this.#data?.message ?? '')
            .split(/\n{2,}/)
            .map((part: string): string => part.trim())
            .filter((part: string): boolean => part.length > 0);
        this.title = parts[0] ?? '';
        this.paragraphs = parts.slice(1);
    }

    protected onClose(): void {
        this.#dialogRef.close();
    }
}

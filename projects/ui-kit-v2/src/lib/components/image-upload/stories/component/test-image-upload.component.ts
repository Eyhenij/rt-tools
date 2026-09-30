import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Signal, signal, viewChild, WritableSignal } from '@angular/core';

import { WINDOW } from '@rt-tools/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtButtonDirective } from '../../../button';
import { IRtImageCropper } from '../../../image-cropper';
import { drawStoryCropperSample } from '../../../image-cropper/stories/component/story-cropper-sample';
import { RtImageUploadComponent } from '../../rt-image-upload.component';

/**
 * Демонстрационная обёртка загрузчика: держит изменяемое состояние, на которое Storybook вешает
 * контролы. «Бросить демо-картинку» отдаёт загрузчику нарисованный файл так же, как его отдаёт
 * брошенный на зону, — посмотреть обрезку можно без своего файла. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-image-upload',
    templateUrl: './test-image-upload.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtButtonDirective,
        RtImageUploadComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtImageUploadComponent {
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    readonly #document: Document = inject(DOCUMENT);

    protected readonly upload: Signal<RtImageUploadComponent> = viewChild.required(RtImageUploadComponent);

    public readonly toolbar: readonly string[] = ['drop', 'reset'];

    public readonly summary: WritableSignal<string> = signal(
        'Бросьте изображение на зону, выберите его кнопкой или бросьте демо-картинку.'
    );

    public imageUrl: string | null = null;
    public fileName: string = 'logo.png';
    public tooltip: string = '';
    public downloadable: boolean = true;
    public autoApply: boolean = false;
    public loading: boolean = false;
    public disabled: boolean = false;
    public ratio: number | null = null;
    public round: boolean = false;
    public format: IRtImageCropper.Format | null = null;
    public quality: number = 92;

    /** Подписей под кнопками ряда нет: кнопка называет себя сама */
    public readonly noLabel: () => string = (): string => '';

    public dropSample(): void {
        void drawStoryCropperSample(this.#document, this.#window).then((sample: File | null): void => this.upload().choose(sample));
    }

    /**
     * Загрузчик держит применённую картинку, пока приложение не даст новый адрес. Пустая строка —
     * новый адрес без картинки: при `null` на входе ничего не поменялось бы, и картинка осталась бы.
     */
    public reset(): void {
        this.imageUrl = this.imageUrl === '' ? null : '';
        this.summary.set('Картинка сброшена: на месте снова зона загрузки.');
    }

    public onChanged(file: File): void {
        this.summary.set(`Приложение получило ${file.name}: ${file.type}, ${Math.round(file.size / 1024)} КБ.`);
    }
}

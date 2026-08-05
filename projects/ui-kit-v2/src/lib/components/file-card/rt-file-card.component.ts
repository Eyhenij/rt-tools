import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { formatFileSize } from '../../util';

import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { IRtIconButton } from '../icon-button/rt-icon-button.model';
import { RtIconComponent } from '../icon/rt-icon.component';
import { IRtIcon } from '../icon/rt-icon.model';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { deriveFileTitle, getFileTypeIcon } from './file-card.helper';
import { IRtFileCard } from './rt-file-card.model';
import { RtTruncateMiddlePipe } from './rt-truncate-middle.pipe';

const BEM_BLOCK: string = 'rt-file-card';

/** Иконка типа файла крупнее прочего: по ней карточку находят взглядом. */
const ICON_SIZES: Readonly<Record<IRtFileCard.Size, IRtIcon.Size>> = {
    sm: 'sm',
    md: 'xl',
    lg: 'xl',
};

/** Кнопки действий: в компактной карточке они не должны задавать её высоту. */
const ACTION_SIZES: Readonly<Record<IRtFileCard.Size, IRtIconButton.Size>> = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
};

/**
 * Карточка загруженного файла: цветная иконка типа, заголовок (выведенный из имени),
 * усечённое по середине имя файла, бейдж размера и опциональные действия справа
 * (скачать / переименовать / удалить).
 *
 * Презентационный компонент: сам ничего не решает, только эмиттит события действий.
 * Кнопки включаются точечно через `showDownload`/`showRemove`/`showRename` — в режиме
 * загрузки обычно нужен только remove, при показе сохранённых файлов — download.
 *
 * `showRename` по умолчанию выключен и сейчас нигде не включается: бэкенд не
 * поддерживает переименование (`original_name` неизменяем после создания). Вход
 * оставлен, чтобы кнопку можно было включить без правки компонента, когда появится API.
 */
@Component({
    selector: 'rt-file-card',
    templateUrl: './rt-file-card.component.html',
    styleUrls: ['./rt-file-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconComponent,
        RtIconButtonComponent,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,

        // pipes
        RtTruncateMiddlePipe,
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-file-card--sm]': "size() === 'sm'",
        '[class.rt-file-card--md]': "size() === 'md'",
        '[class.rt-file-card--lg]': "size() === 'lg'",
    },
})
export class RtFileCardComponent {
    /** Имя цветной иконки типа файла по расширению. */
    protected readonly iconName: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => getFileTypeIcon(this.name()));

    /** Заголовок карточки, выведенный из имени файла (без расширения, разделители → пробелы). */
    protected readonly title: Signal<string> = computed((): string => deriveFileTitle(this.name()));

    /** Отформатированный размер; пустая строка → размер неизвестен. */
    protected readonly sizeLabel: Signal<string> = computed((): string => formatFileSize(this.sizeBytes()));

    /** Показывать ли бейдж размера. */
    protected readonly hasSize: Signal<boolean> = computed((): boolean => this.sizeLabel() !== '');

    /** Размер иконки типа файла — маппится от размера карточки. */
    protected readonly iconSize: Signal<IRtIcon.Size> = computed((): IRtIcon.Size => ICON_SIZES[this.size()]);

    /** Размер кнопок действий — маппится от размера карточки. */
    protected readonly actionSize: Signal<IRtIconButton.Size> = computed((): IRtIconButton.Size => ACTION_SIZES[this.size()]);

    /** Имя файла с расширением — обязательно. */
    public readonly name: InputSignal<string> = input.required<string>();

    /** Размер в байтах. `null` → бейдж размера скрыт. */
    public readonly sizeBytes: InputSignal<number | null> = input<number | null>(null);

    /** Плотность карточки: `sm` для тесных мест вроде композера, `lg` — для страниц. */
    public readonly size: InputSignal<IRtFileCard.Size> = input<IRtFileCard.Size>('md');

    /** Показывать кнопку скачивания. */
    public readonly showDownload: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Показывать кнопку удаления. */
    public readonly showRemove: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Показывать кнопку переименования (отключена до появления API на бэке). */
    public readonly showRename: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Блокирует кнопки действий (например, во время сабмита формы). */
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Запрошено скачивание файла. */
    public readonly download: OutputEmitterRef<void> = output<void>();

    /** Запрошено удаление файла. */
    public readonly removed: OutputEmitterRef<void> = output<void>();

    /** Запрошено переименование файла. */
    public readonly rename: OutputEmitterRef<void> = output<void>();

    protected onDownload(): void {
        this.download.emit();
    }

    protected onRemove(): void {
        this.removed.emit();
    }

    protected onRename(): void {
        this.rename.emit();
    }
}

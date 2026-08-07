import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    HostListener,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { rtKitLabel } from '../../i18n';
import { IRtFileDrop } from './rt-file-drop.model';

const BEM_BLOCK: string = 'rt-file-drop';

/** Задержка скрытия оверлея: dragleave стреляет при переходе между дочерними
    элементами, без debounce рамка мерцает. */
const DRAG_LEAVE_DEBOUNCE_MS: number = 80;

/**
 * Зона перетаскивания файлов: оборачивает произвольный контент через
 * content-projection и превращает его в drop-зону. При перетаскивании файла над
 * областью рисует приглушающий оверлей-приглашение поверх контента, на drop —
 * эмитит выброшенные файлы через `(filesDropped)`.
 *
 * Мультизонный режим: при непустом `zones` оверлей делится на вертикальную стопку
 * равных зон с подписями; зона под курсором подсвечивается, drop эмитится через
 * `(zoneFilesDropped)` с id зоны (а `(filesDropped)` в этом режиме НЕ эмитится).
 * Зона курсора вычисляется по Y-координате против host-rect — оверлей остаётся
 * pointer-events:none, drag-события продолжают идти в host-listener'ы.
 *
 * `accept` (формат как у нативного input[accept]) отфильтровывает неподходящие
 * файлы до эмита — drop в обход файл-пикера не проносит запрещённые расширения;
 * отбрасывание молчаливое, как у самого пикера.
 *
 * Слушает drag-события на собственном host'е (всплывают со всего спроецированного
 * контента), гасит браузерный навигейт по файлу и принимает только перетаскивание
 * файлов (а не внутренний drag элементов формы). Потребитель управляет приёмом
 * через `[disabled]` (например «активна вкладка файлов и форма редактируема») и
 * сам решает, что делать с файлами — компонент состояние файлов не хранит.
 *
 * Оверлей `pointer-events: none` — не перехватывает drag/drop, события доходят до
 * host-listener'ов.
 */
@Component({
    selector: 'rt-file-drop',
    templateUrl: './rt-file-drop.component.html',
    styleUrl: './rt-file-drop.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtFileDropComponent {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);

    readonly #t_uiFileDropOverlay: Signal<string> = rtKitLabel('uiFileDropOverlay');

    #dragLeaveTimer: ReturnType<typeof setTimeout> | null = null;

    /** Активна ли подсветка drop-зоны (файл тащат над областью). */
    protected readonly isDragging: WritableSignal<boolean> = signal(false);

    /** Зона под курсором в мультизонном режиме (id из `zones`). */
    protected readonly activeZoneId: WritableSignal<string | null> = signal(null);

    protected readonly hasZones: Signal<boolean> = computed((): boolean => this.zones().length > 0);

    protected readonly overlayText: Signal<string> = computed((): string => this.overlayLabel() || this.#t_uiFileDropOverlay());

    /** Приём drop'а выключен (потребитель решает по своему контексту). */
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly overlayLabel: InputSignal<string> = input<string>('');

    /** Мультизонный режим: непустой список зон делит оверлей на стопку целей. */
    public readonly zones: InputSignal<readonly IRtFileDrop.Zone[]> = input<readonly IRtFileDrop.Zone[]>([]);

    /** Фильтр расширений/MIME (формат нативного input[accept]); пусто — без фильтра. */
    public readonly accept: InputSignal<string> = input<string>('');

    public readonly filesDropped: OutputEmitterRef<File[]> = output<File[]>();

    /** Drop в мультизонном режиме: файлы + id зоны, куда их бросили. */
    public readonly zoneFilesDropped: OutputEmitterRef<IRtFileDrop.ZoneDrop> = output<IRtFileDrop.ZoneDrop>();

    public readonly draggingChange: OutputEmitterRef<boolean> = output<boolean>();

    constructor() {
        this.#destroyRef.onDestroy((): void => this.#clearLeaveTimer());
    }

    @HostListener('dragenter', ['$event'])
    @HostListener('dragover', ['$event'])
    protected onDragOver(event: DragEvent): void {
        if (this.disabled() || !this.#isFileDrag(event)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'copy';
        }
        this.#clearLeaveTimer();
        this.#setDragging(true);
        if (this.hasZones()) {
            this.activeZoneId.set(this.#zoneIdAt(event.clientY));
        }
    }

    @HostListener('dragleave', ['$event'])
    protected onDragLeave(event: DragEvent): void {
        if (!this.isDragging()) {
            return;
        }
        event.preventDefault();
        this.#clearLeaveTimer();
        this.#dragLeaveTimer = setTimeout((): void => {
            this.#dragLeaveTimer = null;
            this.#setDragging(false);
        }, DRAG_LEAVE_DEBOUNCE_MS);
    }

    @HostListener('drop', ['$event'])
    protected onDrop(event: DragEvent): void {
        if (this.disabled() || !this.#isFileDrag(event)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.#clearLeaveTimer();
        this.#setDragging(false);

        const files: File[] = Array.from(event.dataTransfer?.files ?? []).filter((file: File): boolean => this.#matchesAccept(file));
        if (files.length === 0) {
            return;
        }
        if (!this.hasZones()) {
            this.filesDropped.emit(files);
            return;
        }
        const zoneId: string | null = this.#zoneIdAt(event.clientY);
        if (zoneId === null) {
            return;
        }
        this.zoneFilesDropped.emit({ zoneId, files });
    }

    /** Меняет dragging-флаг и эмитит изменение только при реальном переходе. */
    #setDragging(value: boolean): void {
        if (this.isDragging() === value) {
            return;
        }
        this.isDragging.set(value);
        this.draggingChange.emit(value);
        if (!value) {
            this.activeZoneId.set(null);
        }
    }

    /** Зона по Y-координате курсора: стопка равных по высоте полос host-rect. */
    #zoneIdAt(clientY: number): string | null {
        const zones: readonly IRtFileDrop.Zone[] = this.zones();
        if (zones.length === 0) {
            return null;
        }
        const rect: DOMRect = this.#host.nativeElement.getBoundingClientRect();
        if (rect.height <= 0) {
            return zones[0].id;
        }
        const ratio: number = (clientY - rect.top) / rect.height;
        const index: number = Math.min(zones.length - 1, Math.max(0, Math.floor(ratio * zones.length)));
        return zones[index].id;
    }

    /** Файл проходит accept-фильтр (расширение `.pdf` / MIME `image/png` / `image/*`). */
    #matchesAccept(file: File): boolean {
        const accept: string = this.accept().trim();
        if (accept === '') {
            return true;
        }
        const name: string = file.name.toLowerCase();
        const mime: string = file.type.toLowerCase();
        return accept.split(',').some((raw: string): boolean => {
            const token: string = raw.trim().toLowerCase();
            if (token === '') {
                return false;
            }
            if (token.startsWith('.')) {
                return name.endsWith(token);
            }
            if (token.endsWith('/*')) {
                return mime.startsWith(token.slice(0, -1));
            }
            return mime === token;
        });
    }

    /** Перетаскивают именно файлы (а не внутренний drag элементов формы). */
    #isFileDrag(event: DragEvent): boolean {
        const types: readonly string[] | undefined = event.dataTransfer?.types;
        return types?.includes('Files') ?? false;
    }

    #clearLeaveTimer(): void {
        if (this.#dragLeaveTimer !== null) {
            clearTimeout(this.#dragLeaveTimer);
            this.#dragLeaveTimer = null;
        }
    }
}

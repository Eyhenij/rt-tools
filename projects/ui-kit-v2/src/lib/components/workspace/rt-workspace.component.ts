import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    output,
    OutputEmitterRef,
    Renderer2,
    signal,
    Signal,
    untracked,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { StorageService } from '@rt-tools/core';
import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtWorkspaceAsideDirective, RtWorkspaceCenterDirective, RtWorkspaceListDirective } from './rt-workspace.directives';
import { IRtWorkspace } from './rt-workspace.model';

const BEM_BLOCK: string = 'rt-workspace';
const STORAGE_PREFIX: string = 'rt-workspace:';
const KEYBOARD_STEP: number = 16;

interface IDragState {
    kind: IRtWorkspace.PanelKind;
    startX: number;
    startWidth: number;
}

@Component({
    selector: 'rt-workspace',
    templateUrl: './rt-workspace.component.html',
    styleUrls: ['./rt-workspace.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,

        // standalone components / directives
        RtIconButtonComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-workspace--has-active]': 'hasActive()',
        '[class.rt-workspace--aside-collapsed]': 'asideCollapsed()',
        '[class.rt-workspace--resizing]': 'resizing()',
        '[style.--rt-workspace-list-size]': "listWidth() + 'px'",
        '[style.--rt-workspace-aside-size]': "asideWidth() + 'px'",
    },
})
export class RtWorkspaceComponent implements IRtWorkspace.PanelApi {
    readonly #storage: StorageService = inject(StorageService);

    readonly #renderer: Renderer2 = inject(Renderer2);

    readonly #hostRef: ElementRef<HTMLElement> = inject(ElementRef);

    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #listWidthOverride: WritableSignal<number | null> = signal<number | null>(null);

    readonly #asideWidthOverride: WritableSignal<number | null> = signal<number | null>(null);

    readonly #asideCollapsed: WritableSignal<boolean> = signal<boolean>(false);

    readonly #asideOpen: WritableSignal<boolean> = signal<boolean>(false);

    readonly #resizing: WritableSignal<boolean> = signal<boolean>(false);

    #restoredKey: string | null = null;

    #dragState: IDragState | null = null;

    #detachDragListeners: (() => void) | null = null;

    protected readonly listSlot: Signal<RtWorkspaceListDirective | undefined> = contentChild(RtWorkspaceListDirective);

    protected readonly centerSlot: Signal<RtWorkspaceCenterDirective | undefined> = contentChild(RtWorkspaceCenterDirective);

    protected readonly asideSlot: Signal<RtWorkspaceAsideDirective | undefined> = contentChild(RtWorkspaceAsideDirective);

    protected readonly resizing: Signal<boolean> = this.#resizing.asReadonly();

    protected readonly slotContext: IRtWorkspace.SlotContext = { $implicit: this };

    public readonly storageKey: InputSignal<string | null> = input<string | null>(null);

    public readonly hasActive: InputSignal<boolean> = input<boolean>(false);

    public readonly listMinWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(240, {
        transform: numberAttribute,
    });

    public readonly listMaxWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(480, {
        transform: numberAttribute,
    });

    public readonly listDefaultWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(320, {
        transform: numberAttribute,
    });

    public readonly asideMinWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(280, {
        transform: numberAttribute,
    });

    public readonly asideMaxWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(560, {
        transform: numberAttribute,
    });

    public readonly asideDefaultWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(360, {
        transform: numberAttribute,
    });

    public readonly centerMinWidth: InputSignalWithTransform<number, number | string> = input<number, number | string>(360, {
        transform: numberAttribute,
    });

    public readonly backClicked: OutputEmitterRef<void> = output<void>();

    public readonly listWidth: Signal<number> = computed((): number => this.#listWidthOverride() ?? this.listDefaultWidth());

    public readonly asideWidth: Signal<number> = computed((): number => this.#asideWidthOverride() ?? this.asideDefaultWidth());

    public readonly asideCollapsed: Signal<boolean> = this.#asideCollapsed.asReadonly();

    public readonly asideOpen: Signal<boolean> = this.#asideOpen.asReadonly();

    constructor() {
        effect((): void => {
            const key: string | null = this.storageKey();
            if (key === null || key === this.#restoredKey) {
                return;
            }
            this.#restoredKey = key;
            untracked((): void => this.#restoreFromStorage(key));
        });

        this.#destroyRef.onDestroy((): void => this.#stopDragging());
    }

    public toggleAsideCollapsed(): void {
        this.#asideCollapsed.update((collapsed: boolean): boolean => !collapsed);
        this.#persist();
    }

    public openAside(): void {
        this.#asideOpen.set(true);
    }

    public closeAside(): void {
        this.#asideOpen.set(false);
    }

    public toggleAside(): void {
        this.#asideOpen.update((open: boolean): boolean => !open);
    }

    protected onBackClicked(): void {
        this.closeAside();
        this.backClicked.emit();
    }

    protected onHandlePointerDown(event: PointerEvent, kind: IRtWorkspace.PanelKind): void {
        if (event.button !== 0) {
            return;
        }
        event.preventDefault();
        this.#dragState = {
            kind,
            startX: event.clientX,
            startWidth: kind === 'list' ? this.listWidth() : this.asideWidth(),
        };
        this.#resizing.set(true);

        const detachMove: () => void = this.#renderer.listen('document', 'pointermove', (moveEvent: PointerEvent): void =>
            this.#onDragMove(moveEvent)
        );
        const detachUp: () => void = this.#renderer.listen('document', 'pointerup', (): void => {
            this.#persist();
            this.#stopDragging();
        });
        this.#detachDragListeners = (): void => {
            detachMove();
            detachUp();
        };
    }

    protected onHandleKeydown(event: KeyboardEvent, kind: IRtWorkspace.PanelKind): void {
        let delta: number;
        if (event.key === 'ArrowRight') {
            delta = kind === 'list' ? KEYBOARD_STEP : -KEYBOARD_STEP;
        } else if (event.key === 'ArrowLeft') {
            delta = kind === 'list' ? -KEYBOARD_STEP : KEYBOARD_STEP;
        } else {
            return;
        }
        event.preventDefault();
        const current: number = kind === 'list' ? this.listWidth() : this.asideWidth();
        this.#applyWidth(kind, current + delta);
        this.#persist();
    }

    protected onHandleReset(kind: IRtWorkspace.PanelKind): void {
        const override: WritableSignal<number | null> = kind === 'list' ? this.#listWidthOverride : this.#asideWidthOverride;
        override.set(null);
        this.#persist();
    }

    #onDragMove(event: PointerEvent): void {
        const drag: IDragState | null = this.#dragState;
        if (drag === null) {
            return;
        }
        const dx: number = event.clientX - drag.startX;
        const rawWidth: number = drag.kind === 'list' ? drag.startWidth + dx : drag.startWidth - dx;
        this.#applyWidth(drag.kind, rawWidth);
    }

    #applyWidth(kind: IRtWorkspace.PanelKind, rawWidth: number): void {
        const override: WritableSignal<number | null> = kind === 'list' ? this.#listWidthOverride : this.#asideWidthOverride;
        override.set(this.#clampWidth(kind, rawWidth));
    }

    #clampWidth(kind: IRtWorkspace.PanelKind, rawWidth: number): number {
        const min: number = kind === 'list' ? this.listMinWidth() : this.asideMinWidth();
        const configMax: number = kind === 'list' ? this.listMaxWidth() : this.asideMaxWidth();
        const otherWidth: number = kind === 'list' ? this.asideWidth() : this.listWidth();
        const hostWidth: number = this.#hostRef.nativeElement.clientWidth;
        const available: number = hostWidth > 0 ? hostWidth - otherWidth - this.centerMinWidth() : Number.POSITIVE_INFINITY;
        const max: number = Math.max(min, Math.min(configMax, available));
        return Math.round(Math.min(max, Math.max(min, rawWidth)));
    }

    #stopDragging(): void {
        this.#detachDragListeners?.();
        this.#detachDragListeners = null;
        this.#dragState = null;
        this.#resizing.set(false);
    }

    #restoreFromStorage(key: string): void {
        const stored: IRtWorkspace.PersistedState | null =
            this.#storage.getItem<IRtWorkspace.PersistedState>(`${STORAGE_PREFIX}${key}`) ?? null;
        if (stored === null || typeof stored !== 'object') {
            return;
        }
        if (typeof stored.listWidth === 'number') {
            this.#listWidthOverride.set(this.#clampWidth('list', stored.listWidth));
        }
        if (typeof stored.asideWidth === 'number') {
            this.#asideWidthOverride.set(this.#clampWidth('aside', stored.asideWidth));
        }
        this.#asideCollapsed.set(stored.asideCollapsed === true);
    }

    #persist(): void {
        const key: string | null = this.storageKey();
        if (key === null) {
            return;
        }
        const state: IRtWorkspace.PersistedState = {
            listWidth: this.listWidth(),
            asideWidth: this.asideWidth(),
            asideCollapsed: this.asideCollapsed(),
        };
        this.#storage.setItem(`${STORAGE_PREFIX}${key}`, state);
    }
}

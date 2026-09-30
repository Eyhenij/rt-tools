import { computed, DestroyRef, signal, Signal, WritableSignal } from '@angular/core';

import {
    clampSideMenuWidth,
    reportedSideMenuWidth,
    sideMenuWidthByKey,
    startSideMenuWidthDrag,
    TRtPointerListen,
} from './rt-side-menu.logic';

/** Что тяга просит у меню. Сама она ни о ширине не помнит, ни наружу говорить не умеет. */
export interface IRtSideMenuResizeHooks {
    /** Ширина, о которой меню просит по концу тяги или по нажатой клавише. */
    askWidth: (width: number) => void;
    /** Начало и конец тяги для потребителя: по ним он накрывает чужие кадры и снимает накрытие. */
    started: () => void;
    ended: () => void;
    /** Панель подменю — по ней замеряется нарисованная ширина. Пустая, пока панели нет. */
    panel: () => HTMLElement | null;
    /** Ширина, названная потребителем или настройками. Пустая — ширину ставит оформление. */
    namedWidth: () => number | null;
}

/**
 * Тяга ширины закреплённого подменю: натянутая ширина и снятие слушателей. Механика событий —
 * `startSideMenuWidthDrag` в логике рядом, здесь держится только то, что живёт дольше одного события.
 */
export class RtSideMenuResize {
    /** Натянутая ширина. Пустая — тяги нет, и ширину ставит потребитель или оформление. */
    readonly #draggedWidth: WritableSignal<number | null> = signal(null);
    readonly #listen: TRtPointerListen;
    readonly #hooks: IRtSideMenuResizeHooks;

    #stop: (() => void) | null = null;

    public readonly draggedWidth: Signal<number | null> = this.#draggedWidth.asReadonly();

    /**
     * Ширина для диктора: только то, что кит знает сам. Не названо ничего и ничего не тянули — числа
     * нет: выдуманное назвало бы ширину, которой панель не нарисована.
     */
    public readonly valueNow: Signal<number | null> = computed((): number | null => {
        const width: number | null = this.#draggedWidth() ?? this.#hooks.namedWidth();

        return width === null ? null : clampSideMenuWidth(width);
    });

    /**
     * Меню, разрушенное посреди тяги, кончает её здесь же: иначе накрытие чужих кадров, снимаемое по
     * концу, осталось бы стоять.
     */
    constructor(listen: TRtPointerListen, hooks: IRtSideMenuResizeHooks, destroyRef?: DestroyRef) {
        this.#listen = listen;
        this.#hooks = hooks;
        destroyRef?.onDestroy((): void => this.finish());
    }

    /** Тяга идёт. Второе нажатие при начатой тяге ничего не начинает: указатель уже захвачен. */
    public isRunning(): boolean {
        return this.#stop !== null;
    }

    /**
     * Нажата клавиша на ручке. Просьба о ширине уходит сразу: жеста нет, и держать её не до чего.
     * Отрицательный ответ — клавиша не о ширине, и умолчание у неё не отменяется.
     */
    public pressKey(key: string, from: number): boolean {
        const width: number | null = sideMenuWidthByKey(key, from);

        if (width === null) {
            return false;
        }

        this.#hooks.askWidth(width);

        return true;
    }

    public start(event: PointerEvent, startWidth: number): void {
        if (this.isRunning()) {
            return;
        }

        const stop: (() => void) | null = startSideMenuWidthDrag(event, startWidth, this.#listen, {
            onWidth: (width: number): void => this.#draggedWidth.set(width),
            onEnd: (): void => this.finish(),
        });

        if (stop !== null) {
            this.#stop = stop;
            this.#hooks.started();
        }
    }

    /** Конец тяги. Наружу уходит то число, которым панель нарисована: нижний предел держит оформление. */
    public finish(): void {
        if (!this.isRunning()) {
            return;
        }

        // Замер идёт до сброса натянутой ширины: сбросив её, панель перерисуют, и мерить будет нечего.
        const width: number | null = this.#draggedWidth();
        const drawn: number | null = width === null ? null : reportedSideMenuWidth(width, this.#hooks.panel());

        this.#stop?.();
        this.#stop = null;
        this.#draggedWidth.set(null);

        if (drawn !== null) {
            this.#hooks.askWidth(drawn);
        }

        this.#hooks.ended();
    }
}

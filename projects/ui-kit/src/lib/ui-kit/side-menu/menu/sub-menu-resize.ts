import { computed, signal, Signal, WritableSignal } from '@angular/core';

import { clampSubMenuWidth, reportedSubMenuWidth, startSubMenuWidthDrag, subMenuWidthByKey, TPointerListen } from '../side-menu.logic';

/**
 * Что тяга просит у меню. Сама она ни о ширине не помнит, ни наружу говорить не умеет: ширину
 * хранит потребитель, а события наружу отдаёт компонент.
 */
export interface ISubMenuResizeHooks {
    /** Ширина, о которой меню просит потребителя по концу тяги. */
    askWidth: (width: number) => void;
    /** Начало и конец тяги для потребителя: по ним он накрывает чужие кадры и снимает накрытие. */
    started: () => void;
    ended: () => void;
    /** Панель подменю — по ней замеряется нарисованная ширина. Пустая, пока панели нет. */
    panel: () => HTMLElement | null;
    /** Ширина, названная потребителем. Пустая — ширину ставит оформление, и кит её не знает. */
    namedWidth: () => number | null;
}

/**
 * Тяга ширины закреплённого подменю.
 *
 * Лежит отдельно от меню по той же причине, что и ходьба с клавиатуры рядом: файл меню упёрся в
 * предел длины, а состояний здесь два — натянутая ширина и снятие слушателей.
 *
 * Механика самих событий — `startSubMenuWidthDrag` в логике рядом: она чистая и проверяется
 * вызовом. Здесь держится только то, что живёт дольше одного события.
 */
export class SubMenuResize {
    /** Натянутая ширина. Пустая — тяги нет, и ширину ставит потребитель или оформление. */
    readonly #draggedWidth: WritableSignal<number | null> = signal(null);
    readonly #listen: TPointerListen;
    readonly #hooks: ISubMenuResizeHooks;

    #stop: (() => void) | null = null;

    public readonly draggedWidth: Signal<number | null> = this.#draggedWidth.asReadonly();

    /**
     * Ширина для диктора. Только то, что кит знает сам: натянутое или названное потребителем. Не
     * названо ничего и ничего не тянули — числа нет, и кит его не выдумывает: выдуманное назвало бы
     * ширину, которой панель не нарисована.
     */
    public readonly valueNow: Signal<number | null> = computed((): number | null => {
        const width: number | null = this.#draggedWidth() ?? this.#hooks.namedWidth();

        return width === null ? null : clampSubMenuWidth(width);
    });

    constructor(listen: TPointerListen, hooks: ISubMenuResizeHooks) {
        this.#listen = listen;
        this.#hooks = hooks;
    }

    /** Тяга идёт. Второе нажатие при начатой тяге ничего не начинает: указатель уже захвачен. */
    public get running(): boolean {
        return this.#stop !== null;
    }

    /**
     * Нажата клавиша на ручке. Просьба о ширине уходит наружу сразу: тяга держит просьбу до конца
     * жеста, потому что жест есть, — здесь его нет. Начала и конца тяги клавиша не рождает:
     * потребитель накрывает чужой кадр на время, пока рука ведёт указатель, а клавиша не ведёт.
     *
     * Отрицательный ответ значит, что клавиша не о ширине, и умолчание у неё не отменяется: иначе
     * ручка съела бы переход по табуляции и всё, что на ней не написано.
     */
    public pressKey(key: string, from: number): boolean {
        const width: number | null = subMenuWidthByKey(key, from);

        if (width === null) {
            return false;
        }

        this.#hooks.askWidth(width);

        return true;
    }

    public start(event: PointerEvent, startWidth: number): void {
        if (this.running) {
            return;
        }

        const stop: (() => void) | null = startSubMenuWidthDrag(event, startWidth, this.#listen, {
            onWidth: (width: number): void => this.#draggedWidth.set(width),
            onEnd: (): void => this.finish(),
        });

        if (stop !== null) {
            this.#stop = stop;
            this.#hooks.started();
        }
    }

    /**
     * Конец тяги. Наружу уходит то число, которым панель нарисована: нижний предел держит
     * оформление — панель не бывает уже той ширины, какую задал потребитель, — и узнать его можно
     * одним замером, своего числа у кита нет. Хранит выбор человека потребитель.
     */
    public finish(): void {
        if (!this.running) {
            return;
        }

        // Замер идёт до сброса натянутой ширины: сбросив её, панель перерисуют, и мерить будет нечего.
        const width: number | null = this.#draggedWidth();
        const drawn: number | null = width === null ? null : reportedSubMenuWidth(width, this.#hooks.panel());

        this.#stop?.();
        this.#stop = null;
        this.#draggedWidth.set(null);

        if (drawn !== null) {
            this.#hooks.askWidth(drawn);
        }

        this.#hooks.ended();
    }
}

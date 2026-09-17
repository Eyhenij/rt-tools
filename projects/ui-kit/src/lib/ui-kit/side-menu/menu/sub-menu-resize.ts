import { signal, Signal, WritableSignal } from '@angular/core';

import { startSubMenuWidthDrag, TPointerListen } from '../side-menu.logic';

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

    constructor(listen: TPointerListen, hooks: ISubMenuResizeHooks) {
        this.#listen = listen;
        this.#hooks = hooks;
    }

    /** Тяга идёт. Второе нажатие при начатой тяге ничего не начинает: указатель уже захвачен. */
    public get running(): boolean {
        return this.#stop !== null;
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
     * Конец тяги. Наружу уходит натянутая ширина, а не та, что получилась на экране: нижний предел
     * держит оформление — панель не бывает уже той ширины, какую задал потребитель, — и замерить
     * применённое можно только там, где раскладка уже посчитана. Хранит выбор человека потребитель;
     * вид от этого не меняется, потому что предел стоит в самом оформлении.
     */
    public finish(): void {
        if (!this.running) {
            return;
        }

        const width: number | null = this.#draggedWidth();

        this.#stop?.();
        this.#stop = null;
        this.#draggedWidth.set(null);

        if (width !== null) {
            this.#hooks.askWidth(width);
        }

        this.#hooks.ended();
    }
}

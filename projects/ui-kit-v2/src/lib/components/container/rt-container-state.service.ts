import { Injectable, WritableSignal, signal } from '@angular/core';

/**
 * Приватный signal-store для `rt-container`.
 *
 * Хранит open-state левой docked sidenav. Driver-директива
 * `[rtContainerLeftSidenavPanel]` пишет в `leftSidenavOpen`, шаблон
 * `RtContainerComponent` читает через signal-tracking.
 *
 * Provided component-level через `providers: [RtContainerStateService]` на
 * `RtContainerComponent` — per-instance state, без singleton'а. Pure signal IO
 * с автоматической reactivity.
 *
 * Правая sidenav (overlay) НЕ хранится здесь: её open-state живёт прямо в
 * `RtContainerComponent.rightOpen` сигнале и управляется через `openRight()` /
 * `closeRight()` методы + lifecycle outputs.
 */
@Injectable()
export class RtContainerStateService {
    public readonly leftSidenavOpen: WritableSignal<boolean> = signal<boolean>(true);
}

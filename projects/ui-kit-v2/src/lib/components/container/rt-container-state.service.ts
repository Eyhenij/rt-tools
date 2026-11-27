import { Injectable, WritableSignal, signal } from '@angular/core';

import { RtAsideSheet } from '@rt-tools/ui-kit-v2/aside';

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
 * `closeRight()` методы + lifecycle outputs. Здесь лежит только её вид на телефоне: его читает
 * панель в слоте через `RT_ASIDE_SHEET`, который даёт маркер слота.
 */
@Injectable()
export class RtContainerStateService {
    public readonly leftSidenavOpen: WritableSignal<boolean> = signal<boolean>(true);

    /** Вид правой панели: шторка телефона или панель сбоку; выбирается `openRight()` при открытии. */
    public readonly rightSheet: RtAsideSheet = new RtAsideSheet();
}

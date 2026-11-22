/** Что делает директива, когда указатель входит на панель или уходит с неё. */
export interface IRtPopoverHoverBridge {
    pointerEntered: (pointerType: string) => void;
    mouseEntered: () => void;
    mouseLeft: (relatedTarget: EventTarget | null) => void;
}

/**
 * Мост наведения: при переходе курсора с host'а на панель отложенное закрытие гасится, уход с панели
 * планирует его заново. Без моста панель по наведению закрывалась бы по таймеру, как только мышь
 * покидает host. Слушатели живут на узле оверлея и умирают вместе с ним.
 */
export function rtBindPopoverHoverBridge(overlayElement: HTMLElement, bridge: IRtPopoverHoverBridge): void {
    overlayElement.addEventListener('pointerenter', (event: PointerEvent): void => bridge.pointerEntered(event.pointerType));
    overlayElement.addEventListener('mouseenter', (): void => bridge.mouseEntered());
    overlayElement.addEventListener('mouseleave', (event: MouseEvent): void => bridge.mouseLeft(event.relatedTarget));
}

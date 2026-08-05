export const DRAG_DISMISS_THRESHOLD_PX: number = 80;

export function clampDragDelta(deltaY: number): number {
    return Math.max(0, deltaY);
}

export function shouldDismissDrag(deltaY: number): boolean {
    return deltaY > DRAG_DISMISS_THRESHOLD_PX;
}

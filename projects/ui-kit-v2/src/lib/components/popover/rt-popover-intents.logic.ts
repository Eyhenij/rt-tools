import { OverlayRef } from '@angular/cdk/overlay';

import { filter, map, merge, Observable, tap } from 'rxjs';

import { rtIsNestedOverlay } from './rt-popover-nested.logic';

/**
 * Намерения закрыть панель у триггера: нажатие снаружи, подложка и Escape. Каждое событие стрима — одно
 * намерение, и директива закрывает по нему панель.
 */
export function rtPopoverCloseIntents(overlayRef: OverlayRef, host: HTMLElement): Observable<void> {
    return merge(
        overlayRef.outsidePointerEvents().pipe(
            // Клик по host в режиме click обрабатывает onHostClick (toggle) — не закрываем здесь, иначе двойной
            // toggle (close + open). Клик по вложенной панели — не клик снаружи: закрытие разрушило бы её
            // вместе с нашей до того, как выбор дойдёт до обработчика.
            filter(
                (event: MouseEvent): boolean =>
                    !host.contains(event.target as Node) && !rtIsNestedOverlay(overlayRef.overlayElement, event.target)
            )
        ),
        // Подложка ловит нажатие раньше документа: снаружи оно уже не приходит
        overlayRef.backdropClick(),
        overlayRef.keydownEvents().pipe(
            filter((event: KeyboardEvent): boolean => event.key === 'Escape'),
            tap((event: KeyboardEvent): void => event.preventDefault())
        )
    ).pipe(map((): void => undefined));
}

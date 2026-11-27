import { OverlayRef } from '@angular/cdk/overlay';
import { Renderer2 } from '@angular/core';

/**
 * Подложка закрытой панели: невидима и нажатий не ловит.
 *
 * Стилями этого не сделать. Правила кита живут в слое каскада, а CDK кладёт свои прямо на
 * страницу, вне слоя, — и `.cdk-overlay-backdrop-showing { opacity: 1 }` выигрывает у нашего
 * `opacity: 0` независимо от специфичности: неслоевое правило сильнее слоевого всегда.
 * Подложка при этом висит поверх страницы во весь экран — прозрачная и перехватывающая
 * нажатия, а панель ещё не открывали. Объявление на самом узле сильнее обоих правил.
 *
 * Держится это ровно до открытия: там объявления снимаются, и дальше видом подложки
 * заведуют классы.
 */
export function rtHideBackdrop(renderer: Renderer2, overlayRef: OverlayRef): void {
    const backdropEl: HTMLElement | null = overlayRef.backdropElement;

    if (backdropEl === null) {
        return;
    }

    renderer.setStyle(backdropEl, 'opacity', '0');
    renderer.setStyle(backdropEl, 'pointer-events', 'none');
}

import { ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';

/**
 * Высота, ниже которой ужимать панель под вьюпорт бессмысленно: в такой полосе не
 * видно и одного пункта. Нужна только режиму `fitViewport` — по ней CDK решает,
 * что свободного места под триггером хватает.
 */
const FIT_VIEWPORT_MIN_HEIGHT_PX: number = 120;

/** Что нужно оверлею панели от директивы, которая его создаёт. */
export interface IRtPopoverOverlayRequest {
    readonly overlay: Overlay;
    /** Узел, по которому панель встаёт и меряет ширину. */
    readonly anchor: HTMLElement;
    readonly positions: ConnectedPosition[];
    readonly fitViewport: boolean;
    readonly offsetY: number;
    readonly backdropClass: string;
    readonly panelClasses: string[];
}

/** Созданный оверлей панели и его привязка к триггеру: привязке потом меняют места. */
export interface IRtPopoverOverlay {
    readonly overlayRef: OverlayRef;
    readonly positionStrategy: FlexibleConnectedPositionStrategy;
}

/** Создаёт оверлей панели у триггера: привязка, подгонка под вьюпорт, подложка и классы коробки. */
export function rtCreatePopoverOverlay(request: IRtPopoverOverlayRequest): IRtPopoverOverlay {
    // Сдвиг к краю экрана и ужатие по высоте включаются только по просьбе
    // потребителя: панель, которая и так помещается, обязана стоять у своего
    // триггера — меню строки таблицы, подтверждение, меню профиля.
    const fitViewport: boolean = request.fitViewport;
    const positionStrategy: FlexibleConnectedPositionStrategy = request.overlay
        .position()
        .flexibleConnectedTo(request.anchor)
        .withPush(fitViewport)
        .withFlexibleDimensions(fitViewport)
        // Отступ от края экрана равен отступу от триггера: свободное место
        // считается без него, и ужатая по высоте панель свисала бы за нижний
        // край ровно на этот отступ — вместе со своей рамкой.
        .withViewportMargin(fitViewport ? Math.abs(request.offsetY) : 0)
        .withPositions(request.positions);
    const backdropClass: string = request.backdropClass.trim();
    const config: OverlayConfig = new OverlayConfig({
        positionStrategy,
        scrollStrategy: request.overlay.scrollStrategies.reposition(),
        hasBackdrop: backdropClass !== '',
        backdropClass: backdropClass || undefined,
        panelClass: request.panelClasses,
        // Порог, ниже которого свободного места под триггером считается
        // недостаточно и панель не ужимается, а сдвигается целиком.
        minHeight: fitViewport ? FIT_VIEWPORT_MIN_HEIGHT_PX : undefined,
    });

    return { overlayRef: request.overlay.create(config), positionStrategy };
}

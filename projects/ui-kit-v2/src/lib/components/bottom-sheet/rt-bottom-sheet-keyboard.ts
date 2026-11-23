/** Видимая часть окна над экранной клавиатурой: её верх от верха окна и её высота, в точках. */
export interface IRtSheetKeyboardBox {
    readonly top: number;
    readonly height: number;
}

/** Что берётся у видимой области окна, чтобы посчитать место над клавиатурой. */
export interface IRtSheetViewport {
    readonly height: number;
    readonly offsetTop: number;
}

/** На столько видимая область должна быть ниже окна, чтобы это считалось клавиатурой, а не полосой браузера. */
const KEYBOARD_MIN_PX: number = 120;

/**
 * Место над экранной клавиатурой. Клавиатура телефона окно раскладки не сжимает: она ложится
 * поверх, а меньше становится только видимая область — и ещё она может уехать вниз, когда браузер
 * подвигает страницу к полю. Без клавиатуры видимая область равна окну, и места считать не надо.
 */
export function rtSheetKeyboardBox(windowHeight: number, viewport: IRtSheetViewport | null): IRtSheetKeyboardBox | null {
    if (viewport === null || windowHeight - viewport.height < KEYBOARD_MIN_PX) {
        return null;
    }

    return { top: Math.round(viewport.offsetTop), height: Math.round(viewport.height) };
}

/**
 * Следит за видимой областью окна и сообщает место над клавиатурой при каждой его смене.
 * Возвращает отписку. Окна нет (сервер) или браузер видимую область не сообщает — следить не за чем.
 */
export function rtWatchSheetKeyboard(view: Window | null, report: (box: IRtSheetKeyboardBox | null) => void): () => void {
    const viewport: VisualViewport | null = view?.visualViewport ?? null;
    if (view === null || viewport === null) {
        return (): void => undefined;
    }
    const measure: () => void = (): void => report(rtSheetKeyboardBox(view.innerHeight, viewport));
    viewport.addEventListener('resize', measure);
    viewport.addEventListener('scroll', measure);
    measure();

    return (): void => {
        viewport.removeEventListener('resize', measure);
        viewport.removeEventListener('scroll', measure);
    };
}

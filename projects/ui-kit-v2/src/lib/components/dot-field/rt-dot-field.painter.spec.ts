import { RtDotFieldPainter } from './rt-dot-field.painter';

interface IFakeContext {
    fillStyle: string;
    clearRect: jest.Mock;
    fillRect: jest.Mock;
    setTransform: jest.Mock;
}

interface IFakeWindow {
    devicePixelRatio: number;
    matchMedia: jest.Mock;
    requestAnimationFrame: jest.Mock;
    cancelAnimationFrame: jest.Mock;
    getComputedStyle: jest.Mock;
}

const DOT_COLOR: string = 'rgb(21, 94, 239)';

function fakeContext(): IFakeContext {
    return { fillStyle: '', clearRect: jest.fn(), fillRect: jest.fn(), setTransform: jest.fn() };
}

function fakeWindow(reducedMotion: boolean): IFakeWindow {
    return {
        devicePixelRatio: 2,
        matchMedia: jest.fn((): { matches: boolean } => ({ matches: reducedMotion })),
        requestAnimationFrame: jest.fn((): number => 7),
        cancelAnimationFrame: jest.fn(),
        getComputedStyle: jest.fn((): { color: string } => ({ color: DOT_COLOR })),
    };
}

function canvasWith(context: IFakeContext | null): HTMLCanvasElement {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    Object.defineProperty(canvas, 'clientWidth', { value: 400 });
    Object.defineProperty(canvas, 'clientHeight', { value: 300 });
    jest.spyOn(canvas, 'getContext').mockReturnValue(context as unknown as RenderingContext);

    return canvas;
}

describe('RtDotFieldPainter', (): void => {
    it('SC-UKV-640 — при меньшем движении рисует один кадр и не просит следующего', (): void => {
        const context: IFakeContext = fakeContext();
        const windowRef: IFakeWindow = fakeWindow(true);

        new RtDotFieldPainter(canvasWith(context), windowRef as unknown as Window).start();

        expect(context.clearRect).toHaveBeenCalledTimes(1);
        expect(windowRef.requestAnimationFrame).not.toHaveBeenCalled();
    });

    it('SC-UKV-641 — остановка снимает запрошенный кадр', (): void => {
        const windowRef: IFakeWindow = fakeWindow(false);
        const painter: RtDotFieldPainter = new RtDotFieldPainter(canvasWith(fakeContext()), windowRef as unknown as Window);

        painter.start();
        painter.stop();

        expect(windowRef.requestAnimationFrame).toHaveBeenCalledTimes(1);
        expect(windowRef.cancelAnimationFrame).toHaveBeenCalledWith(7);
    });

    it('SC-UKV-642 — холст без 2D-контекста ничего не рисует и кадров не просит', (): void => {
        const windowRef: IFakeWindow = fakeWindow(false);

        new RtDotFieldPainter(canvasWith(null), windowRef as unknown as Window).start();

        expect(windowRef.matchMedia).not.toHaveBeenCalled();
        expect(windowRef.requestAnimationFrame).not.toHaveBeenCalled();
    });

    it('SC-UKV-643 — точки заливаются вычисленным цветом поля', (): void => {
        const context: IFakeContext = fakeContext();
        const canvas: HTMLCanvasElement = canvasWith(context);

        new RtDotFieldPainter(canvas, fakeWindow(true) as unknown as Window).start();

        expect(context.fillStyle).toBe(DOT_COLOR);
        expect(context.fillRect).toHaveBeenCalled();
        expect(canvas.width).toBe(800);
        expect(canvas.height).toBe(600);
    });
});

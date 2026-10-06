import { DOT_FIELD_CELL, DOT_FIELD_DOT, DOT_FIELD_FRAME_MS, DOT_FIELD_TIME_STEP, dotDensity, isDotLit } from './rt-dot-field.logic';

/**
 * Рисует поле точек на canvas и ведёт его кадры. Окно приходит параметром: класс создаёт
 * компонент, а у этого файла нет внедрения зависимостей.
 */
export class RtDotFieldPainter {
    readonly #canvas: HTMLCanvasElement;
    readonly #window: Window;
    readonly #context: CanvasRenderingContext2D | null;

    #frameId: number | null = null;
    #lastFrameAt: number = 0;
    #time: number = 0;
    #width: number = 0;
    #height: number = 0;

    constructor(canvas: HTMLCanvasElement, windowRef: Window) {
        this.#canvas = canvas;
        this.#window = windowRef;
        this.#context = canvas.getContext('2d');
    }

    /** Без 2D-контекста ничего не рисуется; при просьбе о меньшем движении — один кадр. */
    public start(): void {
        if (!this.#context) {
            return;
        }

        if (this.#window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.#draw(this.#context);
            return;
        }

        this.#frameId = this.#window.requestAnimationFrame((now: number): void => this.#tick(now));
    }

    public stop(): void {
        if (this.#frameId === null) {
            return;
        }

        this.#window.cancelAnimationFrame(this.#frameId);
        this.#frameId = null;
    }

    #tick(now: number): void {
        if (this.#context && now - this.#lastFrameAt >= DOT_FIELD_FRAME_MS) {
            this.#lastFrameAt = now;
            this.#time += DOT_FIELD_TIME_STEP;
            this.#draw(this.#context);
        }

        this.#frameId = this.#window.requestAnimationFrame((next: number): void => this.#tick(next));
    }

    #draw(context: CanvasRenderingContext2D): void {
        this.#resize(context);

        context.clearRect(0, 0, this.#width, this.#height);
        // Цвет — вычисленный `color` поля: тема меняет назначение, а canvas принимает только готовый цвет.
        context.fillStyle = this.#window.getComputedStyle(this.#canvas).color;

        const columns: number = Math.ceil(this.#width / DOT_FIELD_CELL);
        const rows: number = Math.ceil(this.#height / DOT_FIELD_CELL);
        const offset: number = (DOT_FIELD_CELL - DOT_FIELD_DOT) / 2;

        for (let row: number = 0; row < rows; row++) {
            for (let column: number = 0; column < columns; column++) {
                if (isDotLit(dotDensity(column, row, columns, rows, this.#time), column, row)) {
                    context.fillRect(column * DOT_FIELD_CELL + offset, row * DOT_FIELD_CELL + offset, DOT_FIELD_DOT, DOT_FIELD_DOT);
                }
            }
        }
    }

    /** Холст следует размеру родителя и плотности точек экрана. */
    #resize(context: CanvasRenderingContext2D): void {
        const width: number = this.#canvas.clientWidth;
        const height: number = this.#canvas.clientHeight;
        if (width === this.#width && height === this.#height) {
            return;
        }

        const ratio: number = this.#window.devicePixelRatio || 1;
        this.#width = width;
        this.#height = height;
        this.#canvas.width = Math.round(width * ratio);
        this.#canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
}

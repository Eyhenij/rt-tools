/** Размер нарисованного исходника: шире поля, чтобы вписывание было видно */
const SAMPLE_WIDTH: number = 1200;
const SAMPLE_HEIGHT: number = 800;
const GRID_STEP: number = 100;

/**
 * Исходник для историй обрезки, нарисованный холстом на месте: витрина не ходит в сеть, а файл
 * в дереве пришлось бы держать ради одной семьи. Сетка и круг показывают, что вырезано и не
 * искажено ли. Рисуется одинаково на каждом запуске — кадры от него не плывут.
 */
export function drawStoryCropperSample(document: Document, window: Window & typeof globalThis): Promise<File | null> {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = SAMPLE_WIDTH;
    canvas.height = SAMPLE_HEIGHT;
    const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (context === null) {
        return Promise.resolve(null);
    }
    const gradient: CanvasGradient = context.createLinearGradient(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#f59e0b');
    context.fillStyle = gradient;
    context.fillRect(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
    context.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    context.lineWidth = 2;
    for (let x: number = 0; x <= SAMPLE_WIDTH; x += GRID_STEP) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, SAMPLE_HEIGHT);
        context.stroke();
    }
    for (let y: number = 0; y <= SAMPLE_HEIGHT; y += GRID_STEP) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(SAMPLE_WIDTH, y);
        context.stroke();
    }
    context.fillStyle = 'rgba(255, 255, 255, 0.85)';
    context.beginPath();
    context.arc(SAMPLE_WIDTH / 2, SAMPLE_HEIGHT / 2, 200, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#111827';
    context.beginPath();
    context.arc(SAMPLE_WIDTH / 2, SAMPLE_HEIGHT / 2, 60, 0, Math.PI * 2);
    context.fill();

    return new Promise((resolve: (file: File | null) => void): void => {
        canvas.toBlob((blob: Blob | null): void => {
            resolve(blob === null ? null : new window.File([blob], 'sample.png', { type: 'image/png' }));
        }, 'image/png');
    });
}

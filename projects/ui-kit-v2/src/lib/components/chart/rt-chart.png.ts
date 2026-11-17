/** Во сколько раз PNG плотнее экрана: снимок графика читается и на печати. */
const PNG_PIXEL_RATIO: number = 2;

/** Размер графика в точках экрана. */
export interface IRtChartSize {
    readonly width: number;
    readonly height: number;
}

/**
 * Переводит SVG графика в PNG с подложкой его темы.
 *
 * Рендерер SVG отдаёт только SVG: картинка рисуется на холст того же размера, умноженного на
 * плотность, поверх заливки подложкой. Без заливки PNG прозрачен, и тёмный график на белом фоне
 * просмотрщика теряет подписи.
 */
export function rtChartSvgToPng(doc: Document, svg: string, size: IRtChartSize, background: string): Promise<string | null> {
    return new Promise((resolve: (value: string | null) => void): void => {
        const image: HTMLImageElement = doc.createElement('img');

        image.onload = (): void => {
            const canvas: HTMLCanvasElement = doc.createElement('canvas');
            canvas.width = Math.round(size.width * PNG_PIXEL_RATIO);
            canvas.height = Math.round(size.height * PNG_PIXEL_RATIO);
            const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

            if (!context) {
                resolve(null);

                return;
            }

            context.fillStyle = background;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = (): void => resolve(null);
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
}

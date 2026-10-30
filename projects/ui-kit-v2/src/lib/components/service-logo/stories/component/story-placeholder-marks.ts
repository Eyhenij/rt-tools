import { IRtServiceLogo } from '../../rt-service-logo.model';

/**
 * Безымянные заглушки знаков для витрины: простые фигуры, а не логотипы компаний. Знаков
 * чужих компаний в пакете нет, и витрина их не показывает. Байты лежат в адресе — сеть кадру не нужна.
 */
function svgPlaceholder(body: string): string {
    const svg: string = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 32">${body}</svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Заглушка: синий прямоугольник со скруглением — рамка знака целиком. */
export const PLACEHOLDER_MARK_BLOCK: IRtServiceLogo.ImageItem = {
    src: svgPlaceholder('<rect x="2" y="6" width="40" height="20" rx="4" fill="#2563eb"/>'),
    label: 'Placeholder block',
};

/** Заглушка: три фиолетовые полосы разной высоты — знак уже рамки, вписывается по высоте. */
export const PLACEHOLDER_MARK_BARS: IRtServiceLogo.ImageItem = {
    src: svgPlaceholder(
        '<rect x="10" y="14" width="6" height="14" fill="#7c3aed"/><rect x="19" y="8" width="6" height="20" fill="#7c3aed"/><rect x="28" y="4" width="6" height="24" fill="#7c3aed"/>'
    ),
    label: 'Placeholder bars',
};

/** Заглушка: зелёный треугольник — знак узкий, по бокам остаётся воздух. */
export const PLACEHOLDER_MARK_TRIANGLE: IRtServiceLogo.ImageItem = {
    src: svgPlaceholder('<path d="M22 4 L36 28 L8 28 Z" fill="#16a34a"/>'),
    label: 'Placeholder triangle',
};

/** Знак значком кита — способ без своей компании. */
export const PLACEHOLDER_MARK_ICON: IRtServiceLogo.IconItem = { icon: 'wallet', label: 'Bank transfer' };

/** Ряды в один, два и три знака — как в атоме. */
export const PLACEHOLDER_ROWS: readonly (readonly IRtServiceLogo.Item[])[] = [
    [PLACEHOLDER_MARK_BLOCK],
    [PLACEHOLDER_MARK_BLOCK, PLACEHOLDER_MARK_BARS],
    [PLACEHOLDER_MARK_BLOCK, PLACEHOLDER_MARK_BARS, PLACEHOLDER_MARK_TRIANGLE],
];

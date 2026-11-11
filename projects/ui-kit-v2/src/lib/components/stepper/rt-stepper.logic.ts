import { IRtStepper } from './rt-stepper.model';

/** Половина полосы: отрезок уже неё подпись не держит. */
const HALF_BAR: number = 0.5;

/**
 * Отрезок подписи текущего шага. Первый и последний шаг берут всю полосу и прижимаются к её краю.
 * Средний стоит в отрезке с центром над своей точкой шириной в два расстояния до ближнего края:
 * так подпись центрирована над точкой и не выходит за полосу, а длинная переносится внутри отрезка.
 * Так же собран и макет: сдвинуть текст к краю по его собственной ширине макет не умеет.
 * Отрезок у края уже половины полосы даёт подписи в одно-два слова, поэтому там подпись берёт всю
 * полосу и прижимается к ближнему краю, как у крайнего шага.
 */
export function labelSegment(index: number, total: number): IRtStepper.LabelSegment {
    if (total <= 1 || index <= 0) {
        return { start: 0, size: 100, anchor: 'start' };
    }
    if (index >= total - 1) {
        return { start: 0, size: 100, anchor: 'end' };
    }

    const share: number = index / (total - 1);
    const size: number = Math.min(2 * share, 2 - 2 * share);

    if (size < HALF_BAR) {
        return { start: 0, size: 100, anchor: share < HALF_BAR ? 'start' : 'end' };
    }

    return {
        start: Math.max(0, 2 * share - 1) * 100,
        size: size * 100,
        anchor: 'center',
    };
}

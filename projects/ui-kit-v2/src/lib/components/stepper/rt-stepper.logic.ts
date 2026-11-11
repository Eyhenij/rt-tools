import { IRtStepper } from './rt-stepper.model';

/**
 * Отрезок подписи текущего шага. Первый и последний шаг берут всю полосу и прижимаются к её краю.
 * Средний стоит в отрезке с центром над своей точкой шириной в два расстояния до ближнего края:
 * так подпись центрирована над точкой и не выходит за полосу, а длинная переносится внутри отрезка.
 * Так же собран и макет: сдвинуть текст к краю по его собственной ширине макет не умеет.
 */
export function labelSegment(index: number, total: number): IRtStepper.LabelSegment {
    if (total <= 1 || index <= 0) {
        return { start: 0, size: 100, anchor: 'start' };
    }
    if (index >= total - 1) {
        return { start: 0, size: 100, anchor: 'end' };
    }

    const share: number = index / (total - 1);

    return {
        start: Math.max(0, 2 * share - 1) * 100,
        size: Math.min(2 * share, 2 - 2 * share) * 100,
        anchor: 'center',
    };
}

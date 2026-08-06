import { GuardResult, MaybeAsync } from '@angular/router';

import { firstValueFrom, isObservable, Observable, of } from 'rxjs';

import { IRtAsideDeactivate, rtAsideUnsavedGuard } from './rt-route-aside.guard';
import { rootSegmentsOf } from './rt-route-aside.logic';

function panel(answer: boolean): IRtAsideDeactivate {
    return { canDeactivate: (): Observable<boolean> => of(answer) };
}

/**
 * Роутер передаёт гарду ещё три аргумента — маршрут, его состояние и следующее.
 * Ни один из них гард не читает, поэтому спека подставляет пустые значения.
 */
function guardArgs(): [never, never, never] {
    return [undefined, undefined, undefined] as unknown as [never, never, never];
}

/**
 * Ответ гарда, приведённый к одному виду. Роутер разрешает гарду вернуть и
 * значение, и промис, и поток, поэтому спека разбирает все три случая, а не
 * приводит результат к потоку насильно.
 */
async function guardAnswer(component: IRtAsideDeactivate | null): Promise<GuardResult> {
    const answer: MaybeAsync<GuardResult> = rtAsideUnsavedGuard(component, ...guardArgs());
    return isObservable(answer) ? firstValueFrom(answer) : answer;
}

describe('rootSegmentsOf', () => {
    it('разбирает абсолютный адрес на сегменты', () => {
        expect(rootSegmentsOf(['/settings/properties', 'abc'])).toEqual(['settings', 'properties', 'abc']);
    });

    it('сохраняет вложенный аутлет связанной записи', () => {
        const outlets: unknown = { outlets: { ro: ['booking', 'b1'] } };

        expect(rootSegmentsOf(['/bookings', outlets])).toEqual(['bookings', outlets]);
    });

    it('оставляет относительные команды как есть', () => {
        expect(rootSegmentsOf(['booking', 'b1'])).toEqual(['booking', 'b1']);
    });

    it('оставляет как есть команды, начинающиеся не со строки', () => {
        const outlets: unknown = { outlets: { ro: null } };

        expect(rootSegmentsOf([outlets])).toEqual([outlets]);
    });
});

describe('rtAsideUnsavedGuard', () => {
    it('спрашивает панель, когда она есть', async () => {
        await expect(guardAnswer(panel(false))).resolves.toBe(false);
        await expect(guardAnswer(panel(true))).resolves.toBe(true);
    });

    it('уступает место, когда компонента маршрута нет', async () => {
        await expect(guardAnswer(null)).resolves.toBe(true);
    });
});

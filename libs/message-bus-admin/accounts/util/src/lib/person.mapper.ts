/**
 * Перевод человека из ответа приёмника в то, чем пользуется экран.
 *
 * Время приезжает строкой и становится временем здесь, а не в каждой перерисовке. Состояние и
 * пустой вход приходят ключами словаря: слово по ним берёт экран, и выбор языка меняет его без
 * перезагрузки страницы.
 */
import { BaseMapper } from '@rt-tools/utils';

import { personIsLive, personLastLoginKey, personStateKey } from './person.logic';
import { IPerson } from './person.model';

/** Строка списка людей. */
export class PersonShortMapper extends BaseMapper<IPerson.Short.State> {
    public override mapFrom(data: IPerson.Short.Api): IPerson.Short.State {
        // Пустота роли и пустота входа читаются отдельно от приведения к строке: `getAsString`
        // отдал бы на них пустую строку, и «роли нет» стало бы неотличимо от роли с пустым именем.
        const role: string | null = typeof data.role === 'string' ? data.role : null;
        const disabledAt: string | null = typeof data.disabledAt === 'string' ? data.disabledAt : null;
        const enteredAt: string | null = typeof data.lastLoginAt === 'string' ? data.lastLoginAt : null;
        const lastLoginAt: Date | null = enteredAt === null ? null : new Date(enteredAt);

        const name: string = this.typeCast.getAsString(data.name);

        return {
            name,
            lastLoginAt,
            role,
            stateKey: personStateKey(disabledAt),
            lastLoginKey: personLastLoginKey(lastLoginAt),
            isLive: personIsLive(disabledAt),
        };
    }
}

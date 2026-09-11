/**
 * Перевод человека из ответа приёмника в то, чем пользуется экран.
 *
 * Время приезжает строкой и становится временем здесь, а не в каждой перерисовке. Здесь же
 * считаются подписи роли, состояния и пустого входа: посчитанные в шаблоне, они пересчитывались бы
 * на каждой проверке.
 */
import { BaseMapper } from '@rt-tools/utils';

import { personIsLive, personLastLoginLabel, personRoleLabel, personStateLabel } from './person.logic';
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

        return {
            name: this.typeCast.getAsString(data.name),
            roleLabel: personRoleLabel(role),
            stateLabel: personStateLabel(disabledAt),
            lastLoginLabel: personLastLoginLabel(lastLoginAt),
            isLive: personIsLive(disabledAt),
            lastLoginAt,
        };
    }
}

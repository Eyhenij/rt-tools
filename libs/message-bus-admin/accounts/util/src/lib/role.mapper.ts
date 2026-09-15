/**
 * Перевод роли и доступа человека из ответа приёмника в то, чем пользуются экраны.
 *
 * Здесь же считаются подписи прав, признак удаления и вопрос перед ним: посчитанные в шаблоне,
 * они пересчитывались бы на каждой проверке.
 */
import { IPermissionEdit, isRight, TRight } from '@rt/message-bus-common';
import { BaseMapper } from '@rt-tools/utils';

import { rightsLabel } from './right.labels';
import { accessWordsOf, roleCanDelete, roleDeleteQuestion } from './role.logic';
import { IPersonAccess, IRole } from './role.model';

/** Права из ответа: строки не из набора отбрасываются, как и у приёмника. */
function rightsFrom(raw: unknown): TRight[] {
    return Array.isArray(raw) ? raw.filter((one: unknown): one is TRight => typeof one === 'string' && isRight(one)) : [];
}

/** Строка списка ролей и запись панели роли. */
export class RoleShortMapper extends BaseMapper<IRole.Short.State> {
    public override mapFrom(data: IRole.Short.Api): IRole.Short.State {
        const name: string = this.typeCast.getAsString(data.name);
        const rights: TRight[] = rightsFrom(data.rights);
        const people: number = this.typeCast.getAsNumber(data.people);

        return {
            name,
            rights,
            people,
            key: this.typeCast.getAsString(data.key),
            rightsLabel: rightsLabel(rights),
            canDelete: roleCanDelete(people),
            deleteQuestion: roleDeleteQuestion(name),
        };
    }
}

/** Доступ человека для панели прав. */
export class PersonAccessMapper extends BaseMapper<IPersonAccess.State> {
    public override mapFrom(data: IPersonAccess.Api): IPersonAccess.State {
        // Пустота роли читается отдельно от приведения к строке: `getAsString` отдал бы на ней
        // пустую строку, и «роли нет» стало бы неотличимо от роли с пустым ключом
        const role: string | null = typeof data.role === 'string' ? data.role : null;
        const edits: IPermissionEdit[] = Array.isArray(data.edits)
            ? data.edits.filter((one: IPermissionEdit): boolean => isRight(one.right))
            : [];

        return {
            role,
            name: this.typeCast.getAsString(data.name),
            words: accessWordsOf(edits),
            rights: rightsFrom(data.rights),
        };
    }
}

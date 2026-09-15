import { Pipe, PipeTransform } from '@angular/core';
import { ESkillKind, skillKindLabel } from '@rt/message-bus-admin/usage/util';

/**
 * Род скила словом словаря.
 *
 * Пайп, а не готовое значение модели: подпись показывает ячейка таблицы, а значение приходит ей
 * из контекста шаблона. Пайп чистый, и заново он считается только на другом роде.
 */
@Pipe({ name: 'skillKind' })
export class SkillKindPipe implements PipeTransform {
    public transform(kind: ESkillKind): string {
        return skillKindLabel(kind);
    }
}

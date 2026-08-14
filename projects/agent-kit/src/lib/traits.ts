/**
 * Свойства дерева и требования ресурсов к ним.
 *
 * Часть правил верна только там, где есть хранилище, админка или процедуры: наблюдаемость
 * говорит про строки лога и номер обращения, владеющая сущность захода — про запись, которой
 * заход принадлежит. Дереву, которое публикует библиотеки, они не нужны ни одной статьёй, и
 * положенные ему — не долг, а лишние файлы: заполнить их компаньоны нечем.
 *
 * От оси различия это отличается вопросом. Ось спрашивает «какой из трёх» и выбирает ровно
 * один вид; здесь вопрос «есть ли», и таких вещей у одного дерева сразу несколько: дерево,
 * которое публикует пакеты и держит приложение, одним значением не описывается.
 *
 * Требование стоит в имени файла приставкой `needs-`: `observability.needs-db.md`. Приставка —
 * то, чем требование отличимо от вида: `github` читается перечнем осей, `needs-db` — перечнем
 * свойств, и перепутать их нельзя.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ITrait {
    /** Значение, которое дерево пишет в настройку и которое стоит в имени файла после `needs-`. */
    readonly value: string;
    /** Что это свойство означает — им человек и выбирает, что писать про своё дерево. */
    readonly title: string;
}

export const TRAITS_FILE: string = 'traits.json';

/** Приставка требования в имени файла. Ею требование и отличается от вида. */
export const REQUIREMENT_PREFIX: string = 'needs-';

/** Свойства, объявленные пакетом. Нет файла — свойств нет, и требовать нечего. */
export function readTraits(assetsDir: string): readonly ITrait[] {
    let raw: unknown;
    try {
        raw = JSON.parse(readFileSync(join(assetsDir, TRAITS_FILE), 'utf8'));
    } catch {
        return [];
    }
    if (typeof raw !== 'object' || raw === null) {
        return [];
    }

    return Object.entries(raw as Record<string, ITrait>).map(([value, trait]: [string, ITrait]): ITrait => ({
        value,
        title: trait.title ?? '',
    }));
}

/**
 * Свойство, которого ресурс требует именем файла, или `null`, если требования нет.
 *
 * Объявленность свойства здесь не проверяется намеренно: незнакомое свойство — опечатка, и о
 * ней говорят вслух отказом раскладки. Считай эта функция такое имя ресурсом без требования,
 * ресурс лёг бы всякому дереву, а опечатку не заметил бы никто.
 */
export function requirementOf(file: string): string | null {
    const parts: readonly string[] = file.split('.');
    if (parts.length < 3) {
        return null;
    }
    const spoken: string = parts[parts.length - 2];
    if (!spoken.startsWith(REQUIREMENT_PREFIX)) {
        return null;
    }
    const trait: string = spoken.slice(REQUIREMENT_PREFIX.length);

    return trait === '' ? null : trait;
}

/** Имя файла без требования: под ним ресурс и ложится в дерево. */
export function withoutRequirement(file: string, requirement: string | null): string {
    if (requirement === null) {
        return file;
    }
    const parts: string[] = file.split('.');
    parts.splice(parts.length - 2, 1);

    return parts.join('.');
}

/**
 * Отвечает ли дерево на требование ресурса.
 *
 * Ресурс без требования берётся всегда. Требующий — только когда дерево назвало это свойство
 * своим: молчание требованию не отвечает. Класть наугад дороже — пустой компаньон возвращает
 * ровно ту работу, ради которой требования и заведены.
 */
export function answersRequirement(requirement: string | null, has: readonly string[]): boolean {
    return requirement === null || has.includes(requirement);
}

/** Названные свойства, которых пакет не объявлял, — опечатки, и о них говорят по именам. */
export function unknownTraits(named: readonly string[], traits: readonly ITrait[]): readonly string[] {
    const declared: Set<string> = new Set(traits.map((trait: ITrait): string => trait.value));

    return named.filter((name: string): boolean => !declared.has(name));
}

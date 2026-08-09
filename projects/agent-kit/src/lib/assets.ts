/**
 * Что из везомого пакетом взял этот проект и куда оно ложится.
 *
 * Полный набор читает `catalog.ts`, здесь из него остаётся выбранное. Разделено потому, что
 * выбирать приходится раньше, чем раскладывать: `init` спрашивает, какие законы взять, а `list`
 * показывает и то, от чего проект отказался, — обоим нужен набор до отбора.
 */
import { join } from 'node:path';

import { IEntryOfCatalog, isChosen, readCatalog } from './catalog.js';
import { IConfig, SKILL_FILE, SKILL_KINDS, TKind } from './config.js';

export interface IAsset {
    /** Идентификатор: `laws/application/money.md`. Он же путь надстройки и ключ в `only` и `skip`. */
    readonly id: string;
    readonly kind: TKind;
    /** Имя без рода, вида и расширения: `delivery`. У скила — имя каталога, которым его зовут. */
    readonly name: string;
    readonly text: string;
    /** Путь в дереве проекта, куда ресурс ложится. */
    readonly target: string;
    /** Запускается ли файл сам по себе: гарда без права на запуск не существует. */
    readonly executable: boolean;
}

/** Расширение ресурса вместе с точкой; у файла без расширения — пустая строка. */
const extensionOf: (id: string) => string = (id: string): string => {
    const dot: number = id.lastIndexOf('.');
    const slash: number = id.lastIndexOf('/');

    return dot > slash ? id.slice(dot) : '';
};

/**
 * Куда ложится ресурс. Скил читается агентом как `<имя>/SKILL.md`, и другого имени у него быть
 * не может: файл, названный по ресурсу, агент не найдёт вовсе. Остальные роды ложатся файлом —
 * по имени, а не по идентификатору: слой законов из идентификатора в путь переезжает, а вид
 * ресурса нет. У разложенного `git-workflow` хостинга в имени не остаётся: второго вида в этом
 * дереве нет, а агенту, который правило читает, различать их незачем.
 */
export function targetOf(entry: IEntryOfCatalog, layout: Readonly<Record<TKind, string>>): string {
    return SKILL_KINDS.includes(entry.kind)
        ? join(layout[entry.kind], entry.name, SKILL_FILE)
        : join(layout[entry.kind], `${entry.name}${extensionOf(entry.id)}`);
}

export function collectAssets(config: IConfig, assetsDir: string): readonly IAsset[] {
    return readCatalog(assetsDir)
        .filter((entry: IEntryOfCatalog): boolean => isChosen(entry, config))
        .map((entry: IEntryOfCatalog): IAsset => ({
            id: entry.id,
            kind: entry.kind,
            name: entry.name,
            text: entry.text,
            target: targetOf(entry, config.layout),
            executable: entry.executable,
        }));
}

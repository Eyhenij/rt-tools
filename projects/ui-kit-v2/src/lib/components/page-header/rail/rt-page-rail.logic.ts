import { IRtSideMenu } from '@rt-tools/ui-kit-v2/side-menu';

import { IRtPageHeaderView } from '../rt-page-header.logic';

function entryToItem(entry: IRtPageHeaderView.Entry): IRtSideMenu.Item {
    return {
        id: entry.id,
        name: entry.label,
        ...(entry.icon ? { icon: entry.icon } : {}),
        ...(entry.route ? { link: entry.route } : {}),
    };
}

/** Разделы шапки в строках столбца телефона: группы панели идут подряд одним вложенным списком. */
export function railMenuItems(sections: ReadonlyArray<IRtPageHeaderView.Section>): IRtSideMenu.Item[] {
    return sections.map((section: IRtPageHeaderView.Section): IRtSideMenu.Item => {
        const submenu: IRtSideMenu.Item[] = section.panelGroups.flatMap((group: IRtPageHeaderView.Group): IRtSideMenu.Item[] =>
            group.items.map(entryToItem)
        );
        return submenu.length > 0 ? { ...entryToItem(section), submenu } : entryToItem(section);
    });
}

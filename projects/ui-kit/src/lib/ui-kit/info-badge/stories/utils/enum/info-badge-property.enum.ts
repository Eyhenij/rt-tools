export enum EInfoBadgeProperty {
    COLOR = 'color',
    SIZE = 'size',
    ICON = 'icon',
    BOLD = 'bold',
    ELLIPSIS = 'ellipsis',
}

export type TInfoBadgePropertyType =
    EInfoBadgeProperty.BOLD | EInfoBadgeProperty.COLOR | EInfoBadgeProperty.ICON | EInfoBadgeProperty.SIZE | EInfoBadgeProperty.ELLIPSIS;

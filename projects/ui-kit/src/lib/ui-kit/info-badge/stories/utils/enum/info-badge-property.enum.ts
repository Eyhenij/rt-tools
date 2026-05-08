export enum INFO_BADGE_PROPERTY_ENUM {
    COLOR = 'color',
    SIZE = 'size',
    ICON = 'icon',
    BOLD = 'bold',
    ELLIPSIS = 'ellipsis',
}

export type InfoBadgePropertyType =
    | INFO_BADGE_PROPERTY_ENUM.BOLD
    | INFO_BADGE_PROPERTY_ENUM.COLOR
    | INFO_BADGE_PROPERTY_ENUM.ICON
    | INFO_BADGE_PROPERTY_ENUM.SIZE
    | INFO_BADGE_PROPERTY_ENUM.ELLIPSIS;

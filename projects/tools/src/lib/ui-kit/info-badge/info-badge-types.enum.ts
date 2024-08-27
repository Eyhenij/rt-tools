export enum INFO_BADGE_TYPE_ENUM {
    SUCCESS = 'success',
    INFO = 'info',
    WARNING = 'warning',
    PRIMARY = 'primary',
    DISABLED = 'disabled',
}

export type InfoBadgeType =
    | INFO_BADGE_TYPE_ENUM.SUCCESS
    | INFO_BADGE_TYPE_ENUM.INFO
    | INFO_BADGE_TYPE_ENUM.WARNING
    | INFO_BADGE_TYPE_ENUM.PRIMARY
    | INFO_BADGE_TYPE_ENUM.DISABLED;

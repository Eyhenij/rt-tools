export enum EInfoBadgeType {
    SUCCESS = 'success',
    INFO = 'info',
    WARNING = 'warning',
    PRIMARY = 'primary',
    DISABLED = 'disabled',
}

export type TInfoBadgeType =
    EInfoBadgeType.SUCCESS | EInfoBadgeType.INFO | EInfoBadgeType.WARNING | EInfoBadgeType.PRIMARY | EInfoBadgeType.DISABLED;

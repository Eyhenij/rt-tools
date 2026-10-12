/** A media library row as the screen shows it. Its shape is the product's, not a retelling of the contract. */
export interface IMediaFileRow {
    readonly id: string;
    readonly name: string;
    readonly width: number;
    readonly height: number;
    readonly sizeKb: number;
    readonly url: string;
    readonly previewUrl: string;
    readonly createdAt: Date | null;
}

/** A media library page: the rows and the count of all that answer the selection. */
export interface IMediaFileList {
    readonly files: readonly IMediaFileRow[];
    readonly total: number;
}

/**
 * The files the picking window offers. The server checks the kind by the bytes itself; the window
 * filter only saves the person from picking what the server would refuse anyway.
 */
export const MEDIA_ACCEPT: string = 'image/jpeg,image/png,image/webp,image/avif,image/gif';

/** A file picked in the picking window: its id, address and preview address. A link is not typed by hand. */
export interface IPickedMediaFile {
    readonly fileId: string;
    readonly url: string;
    readonly previewUrl: string;
}

/** A smaller copy of a file: its width and address. */
export interface IMediaCopyLink {
    readonly width: number;
    readonly url: string;
}

/**
 * The preview takes the narrowest copy: the list and the picking window need no more, and the
 * original weighs many times more. A file without copies is shown by its original.
 */
export function previewUrlOf(url: string, copies: readonly IMediaCopyLink[]): string {
    let narrowest: IMediaCopyLink | null = null;
    for (const copy of copies) {
        if (narrowest === null || copy.width < narrowest.width) {
            narrowest = copy;
        }
    }
    return narrowest?.url ?? url;
}

/** A media library folder. An empty parent means the folder lies at the root. */
export interface IMediaFolder {
    readonly id: string;
    readonly name: string;
    readonly parentId: string;
}

/** The root of the media library in the crumbs and the selection: it has no id. */
export const MEDIA_ROOT_ID: string = '';

/** The folders lying right in the given one, by name. */
export function foldersIn(folders: readonly IMediaFolder[], parentId: string): IMediaFolder[] {
    return folders
        .filter((folder: IMediaFolder) => folder.parentId === parentId)
        .sort((left: IMediaFolder, right: IMediaFolder) => left.name.localeCompare(right.name));
}

/**
 * The path from the root to a folder — the screen crumbs. The root is not in the path: the screen
 * puts it. An unknown folder gives an empty path, and a loop in the data stops at the first repeat.
 */
export function folderPathOf(folders: readonly IMediaFolder[], folderId: string): IMediaFolder[] {
    const byId: Map<string, IMediaFolder> = new Map<string, IMediaFolder>(folders.map((folder: IMediaFolder) => [folder.id, folder]));
    const path: IMediaFolder[] = [];
    const seen: Set<string> = new Set<string>();
    let current: IMediaFolder | undefined = byId.get(folderId);
    while (current !== undefined && !seen.has(current.id)) {
        seen.add(current.id);
        path.unshift(current);
        current = byId.get(current.parentId);
    }
    return path;
}

import { folderPathOf, foldersIn, IMediaFolder, MEDIA_ROOT_ID, previewUrlOf } from './media-file.model';

const STAIRS: IMediaFolder = { id: 'stairs', name: 'Stairs', parentId: MEDIA_ROOT_ID };
const OAK: IMediaFolder = { id: 'oak', name: 'Oak', parentId: 'stairs' };
const ASH: IMediaFolder = { id: 'ash', name: 'Ash', parentId: 'stairs' };
const BIRCH: IMediaFolder = { id: 'birch', name: 'Birch', parentId: 'stairs' };
const ALL: readonly IMediaFolder[] = [STAIRS, OAK, ASH, BIRCH];

describe('the media library folders', () => {
    it('SC-CMS-65 — a folder holds its direct children by name, and the root holds the folders without a parent', () => {
        expect(foldersIn(ALL, 'stairs')).toEqual([ASH, BIRCH, OAK]);
        expect(foldersIn(ALL, MEDIA_ROOT_ID)).toEqual([STAIRS]);
    });

    it('SC-CMS-65 — the path goes from the root to the folder, and a loop or an unknown folder does not break it', () => {
        expect(folderPathOf(ALL, 'oak')).toEqual([STAIRS, OAK]);
        expect(folderPathOf(ALL, 'missing')).toEqual([]);

        const loop: IMediaFolder[] = [
            { id: 'a', name: 'A', parentId: 'b' },
            { id: 'b', name: 'B', parentId: 'a' },
        ];
        expect(folderPathOf(loop, 'a').map((folder: IMediaFolder) => folder.id)).toEqual(['b', 'a']);
    });
});

describe('the media file preview', () => {
    it('SC-CMS-66 — the preview takes the narrowest copy, and a file without copies shows its original', () => {
        expect(
            previewUrlOf('/full.webp', [
                { width: 1200, url: '/1200.webp' },
                { width: 320, url: '/320.webp' },
                { width: 640, url: '/640.webp' },
            ])
        ).toBe('/320.webp');
        expect(previewUrlOf('/full.webp', [])).toBe('/full.webp');
    });
});

import { type ISniffedImage, MEDIA_MAX_BYTES, sniffImage } from './image-sniff.function';
import {
    buildMediaCopies,
    type IMediaResizer,
    mediaCopies,
    mediaCopyKey,
    mediaCopyWidths,
    mediaKey,
    mediaUrl,
} from './media-copies.function';

/** The headers are assembled by hand: the test needs the first bytes, not a real picture. */
function bytesOf(...parts: (number[] | string)[]): Uint8Array {
    return Uint8Array.from(
        parts.flatMap((part: number[] | string): number[] => (typeof part === 'string' ? Array.from(new TextEncoder().encode(part)) : part))
    );
}

function be32(value: number): number[] {
    return [Math.floor(value / 0x1000000) % 256, Math.floor(value / 0x10000) % 256, Math.floor(value / 256) % 256, value % 256];
}

function le16(value: number): number[] {
    return [value % 256, Math.floor(value / 256) % 256];
}

function le24(value: number): number[] {
    return [...le16(value), Math.floor(value / 0x10000) % 256];
}

function le32(value: number): number[] {
    return [...le24(value), Math.floor(value / 0x1000000) % 256];
}

function sizeOf(sniffed: ISniffedImage | null): [string, number, number] | null {
    return sniffed === null ? null : [sniffed.contentType, sniffed.width, sniffed.height];
}

const PNG_MARK: number[] = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function webpOf(chunk: string, frame: number[]): Uint8Array {
    return bytesOf('RIFF', [0, 0, 0, 0], 'WEBP', chunk, [10, 0, 0, 0], frame);
}

describe('recognising a picture', () => {
    it('SC-CMS-34 — PNG, GIF, JPEG, WebP and AVIF are recognised by their bytes with their size', () => {
        const jpeg: Uint8Array = bytesOf(
            [0xff, 0xd8],
            [0xff, 0xe0, 0x00, 0x04, 0x00, 0x00],
            [0xff, 0xc0, 0x00, 0x11, 0x08, 0x02, 0x58, 0x03, 0x20, 0x03]
        );

        expect(sizeOf(sniffImage(bytesOf(PNG_MARK, be32(13), 'IHDR', be32(1200), be32(800))))).toEqual(['image/png', 1200, 800]);
        expect(sizeOf(sniffImage(bytesOf('GIF89a', le16(320), le16(240))))).toEqual(['image/gif', 320, 240]);
        expect(sizeOf(sniffImage(jpeg))).toEqual(['image/jpeg', 800, 600]);
        expect(sizeOf(sniffImage(webpOf('VP8X', [0, 0, 0, 0, ...le24(1919), ...le24(1079)])))).toEqual(['image/webp', 1920, 1080]);
        expect(sizeOf(sniffImage(webpOf('VP8 ', [0, 0, 0, 0, 0, 0, ...le16(640), ...le16(480)])))).toEqual(['image/webp', 640, 480]);
        expect(sizeOf(sniffImage(webpOf('VP8L', [0, ...le32(799 + 599 * 0x4000), 0, 0, 0, 0, 0])))).toEqual(['image/webp', 800, 600]);
        expect(
            sizeOf(sniffImage(bytesOf(be32(20), 'ftyp', 'avif', [0, 0, 0, 0], be32(20), 'ispe', [0, 0, 0, 0], be32(640), be32(480))))
        ).toEqual(['image/avif', 640, 480]);
    });

    it('SC-CMS-34 — SVG, text, a truncated header, a zero size and an unknown frame are not pictures', () => {
        expect(sniffImage(bytesOf('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
        expect(sniffImage(bytesOf('hello'))).toBeNull();
        expect(sniffImage(bytesOf(PNG_MARK))).toBeNull();
        expect(sniffImage(bytesOf('GIF89a'))).toBeNull();
        expect(sniffImage(bytesOf('GIF89a', le16(0), le16(240)))).toBeNull();
        expect(sniffImage(bytesOf([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x02, 0, 0, 0, 0, 0, 0]))).toBeNull();
        expect(sniffImage(bytesOf('RIFF', [0, 0, 0, 0], 'WEBP'))).toBeNull();
        expect(sniffImage(webpOf('VP8Z', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBeNull();
        expect(sniffImage(bytesOf(be32(20), 'ftyp', 'avif', [0, 0, 0, 0, 0, 0, 0, 0]))).toBeNull();
        expect(MEDIA_MAX_BYTES).toBe(10 * 1024 * 1024);
    });
});

describe('the copies of a picture', () => {
    it('SC-CMS-35 — a wide picture gets all three widths, a copy wider than the original is not built, a narrow one and a GIF get none', () => {
        expect(mediaCopyWidths('image/png', 2400)).toEqual([480, 960, 1600]);
        expect(mediaCopyWidths('image/jpeg', 960)).toEqual([480, 960]);
        expect(mediaCopyWidths('image/png', 300)).toEqual([]);
        expect(mediaCopyWidths('image/gif', 2400)).toEqual([]);
    });

    it('SC-CMS-35 — the keys are built from the record id, and the addresses from the public address without a doubled slash', () => {
        expect(mediaKey('f1', 'png')).toBe('media/f1.png');
        expect(mediaCopyKey('f1', 480)).toBe('media/f1-480.webp');
        expect(mediaUrl('https://cdn.example/', 'media/f1.png')).toBe('https://cdn.example/media/f1.png');
        expect(mediaCopies('https://cdn.example', 'f1', [960, 480])).toEqual([
            { width: 480, url: 'https://cdn.example/media/f1-480.webp' },
            { width: 960, url: 'https://cdn.example/media/f1-960.webp' },
        ]);
    });

    it('SC-CMS-35 — the copies are built by the resizer for every width due', async () => {
        const resizer: IMediaResizer = {
            copy: async (_content: Uint8Array, width: number): Promise<Uint8Array> => Uint8Array.from([width % 256]),
        };

        expect((await buildMediaCopies(resizer, Uint8Array.from([1]), 'image/png', 1000)).map((copy) => copy.width)).toEqual([480, 960]);
    });
});

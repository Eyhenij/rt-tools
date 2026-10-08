/** An image recognised by its first bytes: its type, the key extension in the store, its width and height. */
export interface ISniffedImage {
    readonly contentType: string;
    readonly extension: string;
    readonly width: number;
    readonly height: number;
}

/** The size limit of a media library file: a larger picture is a camera original, not a picture for a page. */
export const MEDIA_MAX_BYTES: number = 10 * 1024 * 1024;

/** The marks at the start of a file. SVG is not among the types: it carries scripts. */
const PNG_SIGNATURE: readonly number[] = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE: readonly number[] = [0xff, 0xd8, 0xff];
const AVIF_BRANDS: readonly string[] = ['avif', 'avis'];

/** The JPEG frame markers followed by the height and the width: every SOF except DHT, JPG and DAC. */
const JPEG_FRAME_MARKERS: ReadonlySet<number> = new Set<number>([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

/** Fourteen bits per side — the limit of the width and the height in a WebP header. */
const WEBP_SIDE: number = 0x4000;

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
    return signature.every((byte: number, index: number): boolean => bytes[index] === byte);
}

function asciiAt(bytes: Uint8Array, offset: number, length: number): string {
    return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function viewOf(bytes: Uint8Array): DataView {
    return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function uint16be(bytes: Uint8Array, offset: number): number {
    return viewOf(bytes).getUint16(offset);
}

function uint16le(bytes: Uint8Array, offset: number): number {
    return viewOf(bytes).getUint16(offset, true);
}

function uint24le(bytes: Uint8Array, offset: number): number {
    return uint16le(bytes, offset) + bytes[offset + 2] * 0x10000;
}

function uint32le(bytes: Uint8Array, offset: number): number {
    return viewOf(bytes).getUint32(offset, true);
}

function uint32be(bytes: Uint8Array, offset: number): number {
    return viewOf(bytes).getUint32(offset);
}

function image(contentType: string, extension: string, width: number, height: number): ISniffedImage | null {
    return width > 0 && height > 0 ? { contentType, extension, width, height } : null;
}

/** PNG: the width and the height are the first fields of the IHDR chunk right after the mark. */
function sniffPng(bytes: Uint8Array): ISniffedImage | null {
    return bytes.length < 24 ? null : image('image/png', 'png', uint32be(bytes, 16), uint32be(bytes, 20));
}

/** GIF: the logical screen size right after the version mark. */
function sniffGif(bytes: Uint8Array): ISniffedImage | null {
    return bytes.length < 10 ? null : image('image/gif', 'gif', uint16le(bytes, 6), uint16le(bytes, 8));
}

/** JPEG: the segments follow one another, and the frame size stands in the first SOF segment. */
function sniffJpeg(bytes: Uint8Array): ISniffedImage | null {
    let offset: number = 2;

    while (offset + 9 < bytes.length && bytes[offset] === 0xff) {
        if (JPEG_FRAME_MARKERS.has(bytes[offset + 1])) {
            return image('image/jpeg', 'jpg', uint16be(bytes, offset + 7), uint16be(bytes, offset + 5));
        }
        offset += 2 + uint16be(bytes, offset + 2);
    }

    return null;
}

function webp(width: number, height: number): ISniffedImage | null {
    return image('image/webp', 'webp', width, height);
}

/** WebP: three frame kinds — lossy, lossless and extended — each writes its size its own way. */
function sniffWebp(bytes: Uint8Array): ISniffedImage | null {
    if (bytes.length < 30) {
        return null;
    }

    switch (asciiAt(bytes, 12, 4)) {
        case 'VP8 ':
            return webp(uint16le(bytes, 26) % WEBP_SIDE, uint16le(bytes, 28) % WEBP_SIDE);
        case 'VP8L': {
            const packed: number = uint32le(bytes, 21);
            return webp((packed % WEBP_SIDE) + 1, (Math.floor(packed / WEBP_SIDE) % WEBP_SIDE) + 1);
        }
        case 'VP8X':
            return webp(uint24le(bytes, 24) + 1, uint24le(bytes, 27) + 1);
        default:
            return null;
    }
}

/** AVIF: the size lies in the `ispe` property — the version and the flags, then the width and the height. */
function sniffAvif(bytes: Uint8Array): ISniffedImage | null {
    for (let offset: number = 12; offset + 16 <= bytes.length; offset++) {
        if (asciiAt(bytes, offset, 4) === 'ispe') {
            return image('image/avif', 'avif', uint32be(bytes, offset + 8), uint32be(bytes, offset + 12));
        }
    }
    return null;
}

function isWebp(bytes: Uint8Array): boolean {
    return asciiAt(bytes, 0, 4) === 'RIFF' && asciiAt(bytes, 8, 4) === 'WEBP';
}

function isAvif(bytes: Uint8Array): boolean {
    return asciiAt(bytes, 4, 4) === 'ftyp' && AVIF_BRANDS.includes(asciiAt(bytes, 8, 4));
}

/**
 * An image of the media library types with its width and height; `null` — the file is none of them
 * or its size cannot be read. The file name and the declared type are never read: the type is
 * recognised by the bytes only.
 */
export function sniffImage(bytes: Uint8Array): ISniffedImage | null {
    if (startsWith(bytes, PNG_SIGNATURE)) {
        return sniffPng(bytes);
    }
    if (startsWith(bytes, JPEG_SIGNATURE)) {
        return sniffJpeg(bytes);
    }
    if (asciiAt(bytes, 0, 4) === 'GIF8') {
        return sniffGif(bytes);
    }
    if (isWebp(bytes)) {
        return sniffWebp(bytes);
    }
    return isAvif(bytes) ? sniffAvif(bytes) : null;
}

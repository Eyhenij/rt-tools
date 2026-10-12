/** The video hosts whose players an embed block may show. */
export enum ECmsEmbedProvider {
    YouTube = 'youtube',
    Rutube = 'rutube',
    VkVideo = 'vkvideo',
}

interface IEmbedHost {
    readonly videoId: RegExp;
    readonly src: (videoId: string) => string;
}

const EMBED_HOSTS: ReadonlyMap<string, IEmbedHost> = new Map<string, IEmbedHost>([
    [
        ECmsEmbedProvider.YouTube,
        {
            videoId: /^[\w-]{11}$/,
            src: (videoId: string): string => `https://www.youtube-nocookie.com/embed/${videoId}`,
        },
    ],
    [
        ECmsEmbedProvider.Rutube,
        {
            videoId: /^[\da-f]{32}$/,
            src: (videoId: string): string => `https://rutube.ru/play/embed/${videoId}`,
        },
    ],
    [
        ECmsEmbedProvider.VkVideo,
        {
            videoId: /^-?\d+_\d+$/,
            src: (videoId: string): string => {
                const separator: number = videoId.indexOf('_');
                const ownerId: string = videoId.slice(0, separator);
                const id: string = videoId.slice(separator + 1);

                return `https://vk.com/video_ext.php?oid=${ownerId}&id=${id}`;
            },
        },
    ],
]);

/**
 * The player address of an embed block, built from the provider and the video id. `null` for a
 * provider off the list or a video id of the wrong shape: the block is then not shown, so no address
 * written by hand ever reaches a frame.
 */
export function embedSrcOfVideo(provider: string, videoId: string): string | null {
    const host: IEmbedHost | undefined = EMBED_HOSTS.get(provider);
    if (!host?.videoId.test(videoId)) {
        return null;
    }

    return host.src(videoId);
}

interface IVideoOfUrl {
    readonly provider: string;
    readonly videoId: string;
}

function youTubeOf(url: URL, parts: readonly string[]): IVideoOfUrl {
    const videoId: string = parts[0] === 'watch' ? (url.searchParams.get('v') ?? '') : (parts[1] ?? '');
    const video: IVideoOfUrl = { videoId, provider: ECmsEmbedProvider.YouTube };

    return video;
}

function vkVideoOf(url: URL, parts: readonly string[]): IVideoOfUrl {
    const fromQuery: string = `${url.searchParams.get('oid') ?? ''}_${url.searchParams.get('id') ?? ''}`;
    const videoId: string = parts[0] === 'video_ext.php' ? fromQuery : (parts[0] ?? '').replace(/^video/, '');
    const video: IVideoOfUrl = { videoId, provider: ECmsEmbedProvider.VkVideo };

    return video;
}

/** The provider and the video id by the address of a video page: each host address has its own parse. */
const VIDEO_OF_HOST: ReadonlyMap<string, (url: URL, parts: readonly string[]) => IVideoOfUrl> = new Map<
    string,
    (url: URL, parts: readonly string[]) => IVideoOfUrl
>([
    ['youtu.be', (_url: URL, parts: readonly string[]): IVideoOfUrl => ({ provider: ECmsEmbedProvider.YouTube, videoId: parts[0] ?? '' })],
    ['youtube.com', youTubeOf],
    ['youtube-nocookie.com', youTubeOf],
    [
        'rutube.ru',
        (_url: URL, parts: readonly string[]): IVideoOfUrl => ({ provider: ECmsEmbedProvider.Rutube, videoId: parts.at(-1) ?? '' }),
    ],
    ['vk.com', vkVideoOf],
    ['vkvideo.ru', vkVideoOf],
]);

/** An address not of a listed host — `null`. */
function embedOfUrl(url: URL): IVideoOfUrl | null {
    const host: string = url.hostname.replace(/^(?:www\.|m\.)/, '');
    const parts: string[] = url.pathname.split('/').filter((part: string): boolean => part !== '');

    return VIDEO_OF_HOST.get(host)?.(url, parts) ?? null;
}

/**
 * The player address of an embedded page by the address the editor typed. The frame gets only the
 * player of a listed host; an address of another site or a video of the wrong shape — `null`, and the
 * block is not shown.
 */
export function embedSrcOf(address: string): string | null {
    let url: URL;
    try {
        url = new URL(address.trim());
    } catch {
        return null;
    }
    const embed: IVideoOfUrl | null = url.protocol === 'https:' ? embedOfUrl(url) : null;

    return embed === null ? null : embedSrcOfVideo(embed.provider, embed.videoId);
}

import { ECmsEmbedProvider, embedSrcOf, embedSrcOfVideo } from './embed-src.function';

describe('the player address of an embed block', () => {
    it('SC-CMS-70 — builds the player address of each listed provider', () => {
        expect(embedSrcOfVideo(ECmsEmbedProvider.YouTube, 'dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
        expect(embedSrcOfVideo(ECmsEmbedProvider.Rutube, '0123456789abcdef0123456789abcdef')).toBe(
            'https://rutube.ru/play/embed/0123456789abcdef0123456789abcdef'
        );
        expect(embedSrcOfVideo(ECmsEmbedProvider.VkVideo, '-123456_456239017')).toBe(
            'https://vk.com/video_ext.php?oid=-123456&id=456239017'
        );
    });

    it('SC-CMS-70 — refuses a provider off the list', () => {
        expect(embedSrcOfVideo('vimeo', 'dQw4w9WgXcQ')).toBeNull();
    });

    it('SC-CMS-70 — refuses a video id that smuggles in an address', () => {
        expect(embedSrcOfVideo(ECmsEmbedProvider.YouTube, 'x"><script>')).toBeNull();
        expect(embedSrcOfVideo(ECmsEmbedProvider.Rutube, '../../evil.example')).toBeNull();
        expect(embedSrcOfVideo(ECmsEmbedProvider.VkVideo, '1_2&oid=3')).toBeNull();
    });

    it('SC-CMS-70 — a video address of a listed host becomes the address of its player', () => {
        expect(embedSrcOf('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
        expect(embedSrcOf('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
        expect(embedSrcOf('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
        expect(embedSrcOf('https://rutube.ru/video/0123456789abcdef0123456789abcdef/')).toBe(
            'https://rutube.ru/play/embed/0123456789abcdef0123456789abcdef'
        );
        expect(embedSrcOf('https://vk.com/video-123456_456239017')).toBe('https://vk.com/video_ext.php?oid=-123456&id=456239017');
        expect(embedSrcOf('https://vkvideo.ru/video_ext.php?oid=-123456&id=456239017')).toBe(
            'https://vk.com/video_ext.php?oid=-123456&id=456239017'
        );
    });

    it('SC-CMS-70 — the address of an arbitrary site does not reach the frame', () => {
        expect(embedSrcOf('https://example.com/page')).toBeNull();
        expect(embedSrcOf('http://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
        expect(embedSrcOf('https://www.youtube.com/watch?v=javascript:alert(1)')).toBeNull();
        expect(embedSrcOf('https://www.youtube.com/watch')).toBeNull();
        expect(embedSrcOf('https://vk.com/video_ext.php')).toBeNull();
        expect(embedSrcOf('https://rutube.ru/')).toBeNull();
        expect(embedSrcOf('https://youtu.be/')).toBeNull();
        expect(embedSrcOf('not an address')).toBeNull();
    });
});

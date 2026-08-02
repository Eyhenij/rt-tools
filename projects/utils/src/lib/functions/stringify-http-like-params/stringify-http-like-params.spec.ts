import { stringifyHttpLikeParams } from './stringify-http-like-params.js';

describe(stringifyHttpLikeParams.name, () => {
    it('should encode every value', () => {
        expect(stringifyHttpLikeParams({ q: 'hello world' })).toEqual({ q: 'hello%20world' });
    });

    it('should stringify non-string values', () => {
        expect(stringifyHttpLikeParams({ page: 1, active: true })).toEqual({ page: '1', active: 'true' });
    });

    it('should return an empty object for an empty input', () => {
        expect(stringifyHttpLikeParams({})).toEqual({});
    });

    it('should join array values with commas, as encodeURI does', () => {
        expect(stringifyHttpLikeParams({ ids: [1, 2] })).toEqual({ ids: '1,2' });
    });

    it('should leave URI-reserved characters intact — it is encodeURI, not encodeURIComponent', () => {
        expect(stringifyHttpLikeParams({ next: 'a/b?c=d&e' })).toEqual({ next: 'a/b?c=d&e' });
    });
});

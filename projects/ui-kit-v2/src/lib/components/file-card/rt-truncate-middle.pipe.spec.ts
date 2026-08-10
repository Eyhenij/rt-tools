import { RtTruncateMiddlePipe } from './rt-truncate-middle.pipe';

/** Пайп чистый и без внедрения — поднимается вызовом конструктора, без TestBed. */
function transform(value: string | null | undefined, maxLength?: number): string {
    const pipe: RtTruncateMiddlePipe = new RtTruncateMiddlePipe();

    return maxLength === undefined ? pipe.transform(value) : pipe.transform(value, maxLength);
}

describe('RtTruncateMiddlePipe', (): void => {
    it('пустое значение отдаёт пустой строкой', (): void => {
        expect(transform(null)).toBe('');
        expect(transform(undefined)).toBe('');
        expect(transform('')).toBe('');
    });

    it('короткое имя не трогает', (): void => {
        expect(transform('report.pdf')).toBe('report.pdf');
    });

    it('имя ровно по границе не трогает', (): void => {
        const name: string = 'a'.repeat(28) + '.pdf';

        expect(name.length).toBe(32);
        expect(transform(name)).toBe(name);
    });

    it('длинное имя режет по середине и оставляет расширение видимым', (): void => {
        const result: string = transform('10588-1_EvaluationSearchReport.pdf');

        expect(result).toBe('10588-1_EvaluationSearchRe...pdf');
        expect(result.length).toBe(32);
    });

    it('длину усечения берёт из довода', (): void => {
        expect(transform('10588-1_EvaluationSearchReport.pdf', 16)).toBe('10588-1_Ev...pdf');
    });

    it('имя без расширения режет с хвоста', (): void => {
        expect(transform('EvaluationSearchReportWithoutExtension')).toBe('EvaluationSearchReportWithout...');
    });

    it('расширение длиннее лимита деградирует до усечения хвоста', (): void => {
        expect(transform('archive.verylongextension', 8)).toBe('archi...');
    });
});

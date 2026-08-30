import { pickedFiles, withAppendedFiles, withoutFileAt } from './rt-chat-files.logic';

function file(name: string): File {
    return new File(['x'], name);
}

describe('withAppendedFiles', () => {
    it('добавленные файлы встают за уже выбранными', () => {
        expect(withAppendedFiles([file('a')], [file('b')]).map((f: File): string => f.name)).toEqual(['a', 'b']);
    });

    it('список приходит новым: прежний остаётся прежним', () => {
        const current: ReadonlyArray<File> = [file('a')];

        withAppendedFiles(current, [file('b')]);

        expect(current.length).toBe(1);
    });
});

describe('withoutFileAt', () => {
    it('снимается файл, стоящий на этом месте', () => {
        expect(withoutFileAt([file('a'), file('b'), file('c')], 1).map((f: File): string => f.name)).toEqual(['a', 'c']);
    });

    it('место вне списка ничего не снимает', () => {
        expect(withoutFileAt([file('a')], 5).map((f: File): string => f.name)).toEqual(['a']);
    });
});

describe('pickedFiles', () => {
    it('поле без выбора отдаёт пустой список', () => {
        expect(pickedFiles(null)).toEqual([]);
    });
});

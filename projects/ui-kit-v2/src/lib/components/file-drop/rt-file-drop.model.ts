/** Контракты rt-file-drop: мультизонный оверлей и адресный drop. */
export namespace IRtFileDrop {
    /** Зона drop-оверлея; зоны рисуются вертикальной стопкой равной высоты. */
    export interface Zone {
        id: string;
        label: string;
        /** Вторая строка подсказки (акцентная, под label). */
        sublabel?: string;
    }

    /** Результат drop'а при мультизонном режиме: файлы + зона, куда их бросили. */
    export interface ZoneDrop {
        zoneId: string;
        files: File[];
    }
}

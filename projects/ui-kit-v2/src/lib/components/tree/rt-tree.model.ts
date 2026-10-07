import { IRtSelect } from '@rt-tools/ui-kit-v2/select';
import { IRtSideMenu } from '@rt-tools/ui-kit-v2/side-menu';
import { IRtTag } from '@rt-tools/ui-kit-v2/tag';

/**
 * Модель `<rt-tree>`: один корневой неймспейс с префиксом `I`. Узел повторяет опцию выбора из
 * списка, чтобы дерево считал тот же модуль, что считает его у `rt-select` и `rt-multiselect`.
 */
export namespace IRtTree {
    /** Узел дерева: опция выбора из списка с необязательным описанием и детьми того же вида. */
    export interface Node<TValue> extends IRtSelect.Option<TValue> {
        /** Вторая строка под подписью. */
        description?: string;
        /** Метки под подписью: поиск отмечает в них найденное так же, как в подписи. */
        badges?: ReadonlyArray<Badge>;
        children?: ReadonlyArray<Node<TValue>>;
    }

    /** Метка узла: текст и цвет палитры `rt-tag`. */
    export interface Badge {
        text: string;
        severity?: IRtTag.Severity;
    }

    /**
     * Чем узел отмечается: флажками (выбор нескольких), радио (выбор одного) или ничем — тогда
     * клик только выбирает узел наружу через `picked`.
     */
    export type Mode = 'multiple' | 'single' | 'none';

    /** Отметка строки: выбрано всё, часть или ничего. У листа части не бывает. */
    export type Mark = IRtSelect.TBranchState;

    /** Видимая строка дерева: та же, что у выбора из списка, с узлом дерева внутри. */
    export interface Row<TValue> extends IRtSelect.Row<TValue> {
        readonly option: Node<TValue>;
    }

    /** Подпись и описание строки, разрезанные по найденному слову. */
    export interface LabelParts {
        readonly label: ReadonlyArray<IRtSideMenu.TitlePart>;
        readonly description: ReadonlyArray<IRtSideMenu.TitlePart>;
        readonly badges: ReadonlyArray<ReadonlyArray<IRtSideMenu.TitlePart>>;
    }

    /** Контекст разметки приложения в конце строки. */
    export interface NodeContext<TValue> {
        $implicit: Node<TValue>;
    }
}

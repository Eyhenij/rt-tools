# Привязка — входы компонента, созданного в коде

- **Именами набора могут быть только входы компонента** — `component-inputs.ts:TRtComponentInputs`
- **Имена отбираются по типу поля, а не по имени** — `component-inputs.ts:TRtInputKeys`
- **Значением каждого имени служит то, что вход принимает снаружи** — `component-inputs.ts:TRtInputValue`
- **Набор неполон по устройству: входы, которых в нём нет, остаются со своими умолчаниями** — `component-inputs.ts:TRtComponentInputs`
- **Входы ставятся своей функцией, а не строкой на месте** — `component-inputs.ts:setRtComponentInputs`

Пути от корня пакета: `projects/core/src/lib/types/`.

- **Сценарий** — Тест
- **`SC-CR-08`** — `component-inputs.spec.ts`
- **`SC-CR-09`** — `component-inputs.spec.ts`
- **`SC-CR-10`** — `component-inputs.spec.ts`
- **`SC-CR-11`** — `component-inputs.spec.ts`

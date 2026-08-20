# Привязка — стор не отдаёт пустоту

| Утверждение                                                            | Где исполняется                             |
| ---------------------------------------------------------------------- | ------------------------------------------- |
| Селектор отдаёт объявленный тип, даже когда поля в состоянии нет       | `base-async-store.service.ts:loading`       |
| Запасной ответ выбирается по пустоте значения                          | `base-async-store.service.ts:requestStatus` |
| Разбор отказа судит пустоту, а не истинность                           | `base-async-store.service.ts:handleError`   |
| Отсутствие значения в общем состоянии списка называется одним способом | `state-base.interface.ts:List`              |
| Начальное состояние объявляет ровно те поля, что стоят в типе          | `base-initial-state.const.ts:ASYNC`         |

Пути от корня пакета: `projects/store/src/lib/`.

| Сценарий   | Тест                               |
| ---------- | ---------------------------------- |
| `SC-ST-01` | `base-async-store.service.spec.ts` |
| `SC-ST-02` | `base-async-store.service.spec.ts` |
| `SC-ST-03` | `base-async-store.service.spec.ts` |
| `SC-ST-04` | `base-async-store.service.spec.ts` |
| `SC-ST-05` | `base-async-store.service.spec.ts` |

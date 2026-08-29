# Привязка — исход мутации виден в панели

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Исход мутации панель показывает внутри себя.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:submitSuccess`
- **У удачи свой сигнал, симметричный сигналу отказа.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:submitSuccess`
- **Сигнал удачи наполняется отдельным доводом мутации, а не доводом тоста.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation`
- **Оба сигнала гаснут в начале каждой попытки.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation`
- **Исходы гасят друг друга.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation`
- **Панель правки после удачной записи остаётся открытой.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation`
- **Панель создания после удачной записи закрывается, пока мутация не сказала обратного.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation`
- **Довод о закрытии главнее режима панели.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation`

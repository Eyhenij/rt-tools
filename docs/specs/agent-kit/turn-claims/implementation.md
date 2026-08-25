# Привязка — утверждения владельцу

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Гард утверждения ждёт текст ответа, а не судит запись, какой застал.** — `projects/agent-kit/assets/hooks/hook-input.sh:rt_turn_has_text` — запись перечитывается короткими попытками; отказ печатает `projects/agent-kit/assets/hooks/claim-guard.sh`; сценарии SC-AK-579, SC-AK-580
- **Слова об ожидании чужого шага судятся наравне с прочими утверждениями.** — `projects/agent-kit/assets/hooks/claim-guard.sh:claims` — строка карты об ожидании прогона; сценарии SC-AK-581, SC-AK-582
- **Ход, в котором совесть нашла повтор разобранного промаха, не заканчивается.** — `projects/agent-kit/assets/hooks/conscience-guard.sh:verdict`
- **Находку снимает действие, а не слова о ней.** — `projects/agent-kit/assets/hooks/conscience-guard.sh:verdict`
- **Верность находки гард не судит.** — `projects/agent-kit/assets/hooks/conscience-guard.sh:reason`
- **Утверждение о состоянии дерева, сказанное владельцу, подтверждается командой того же хода.** — `projects/agent-kit/assets/hooks/claim-guard.sh:claims`
- **У каждого слова-утверждения назван свой род команды.** — `projects/agent-kit/assets/hooks/claim-guard.sh:proof`
- **Команда ищется в том же ходе, а не в прошлых.** — `projects/agent-kit/assets/hooks/claim-guard.sh:turn`
- **Судится сказанное владельцу, а не вывод инструмента.** — `projects/agent-kit/assets/hooks/claim-guard.sh:said`
- **Обещание утверждением не считается.** — `projects/agent-kit/assets/hooks/claim-guard.sh:claims`
- **Отказ называет найденное утверждение.** — `projects/agent-kit/assets/hooks/claim-guard.sh:found`
- **Неверный вывод гард не судит.** — `projects/agent-kit/assets/hooks/claim-guard.sh:claim-guard`
- **Гард утверждения пропускает работу при любой поломке.** — `projects/agent-kit/assets/hooks/claim-guard.sh:transcript`

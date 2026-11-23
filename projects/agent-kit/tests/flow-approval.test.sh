#!/usr/bin/env bash
# Сценарии правила одобрения плана, `approvalOf` движка: одно правило для ответа меню и набранного
# сообщения. Его зовут и `plan-red`, и проверка метки одобрения.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: правило одобрения плана"

TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OWNER="$TESTS/../assets/task-flow/source/owner.mjs"

# Ответ правила на запись: строка одобрения или «нет».
approval() {
    node --input-type=module -e "
        const { approvalOf } = await import('$OWNER');
        console.log(approvalOf(JSON.parse(process.argv[1]), process.argv[2]) ?? 'нет');
    " "$1" "$2" 2>&1
}
menu() { jq -cn --argjson a "$1" '{type:"user",uuid:"m1",message:{content:[{type:"tool_result",content:"answered"}]},toolUseResult:{answers:$a}}'; }
typed() { jq -cn --arg t "$1" '{type:"user",uuid:"t1",message:{role:"user",content:$t}}'; }

# SC-AK-1870 — ответы окна судятся порознь
TWO="$(menu '{"Граница дня?":"До 18:00","Одобряешь план RT-12?":"Одобряю план RT-12"}')"
report "approval: SC-AK-1870 — одобрение вторым вопросом окна засчитано" "$(approval "$TWO" RT-12)" 'Одобряю план RT-12'
SPLIT="$(menu '{"Первый?":"Одобряю","Второй?":"план RT-12"}')"
report "approval: SC-AK-1870 — «Одобряю» и номер из разных ответов не складываются" "$(approval "$SPLIT" RT-12)" 'нет'
LINES="$(menu '{"Что делаем?":"Сначала тесты\nОдобряю план RT-12"}')"
report "approval: SC-AK-1870 — строка одобрения внутри ответа засчитана" "$(approval "$LINES" RT-12)" 'Одобряю план RT-12'

report "approval: SC-AK-1870 — форма разбора: граница дня и «Одобряю замысел» чужого ключа" \
    "$(approval "$(menu '{"Граница дня?":"До 21:00","Одобряешь замысел VM-3774?":"Одобряю замысел VM-3774"}')" VM-3774)" 'Одобряю замысел VM-3774'

# SC-AK-1871 — номер задачи с границами
report "approval: SC-AK-1871 — «RT-12» не одобряет RT-123" "$(approval "$(menu '{"Одобряешь?":"Одобряю план RT-12"}')" RT-123)" 'нет'
report "approval: SC-AK-1871 — «RT-312» не одобряет RT-12" "$(approval "$(menu '{"Одобряешь?":"Одобряю план RT-312"}')" RT-12)" 'нет'
report "approval: SC-AK-1871 — «XRT-12» не одобряет RT-12" "$(approval "$(menu '{"Одобряешь?":"Одобряю план XRT-12"}')" RT-12)" 'нет'
report "approval: SC-AK-1871 — пометка меню после номера не мешает" "$(approval "$(menu '{"Одобряешь?":"Одобряю план RT-12 (Recommended)"}')" RT-12)" 'Одобряю план RT-12 (Recommended)'

# SC-AK-1871 — plan.md и вопрос меню
report "approval: SC-AK-1871 — «plan.md» с номером другой задачи не одобряет" "$(approval "$(menu '{"Одобряешь?":"Одобряю plan.md RT-7"}')" RT-12)" 'нет'
report "approval: SC-AK-1871 — голое «plan.md» одобряет" "$(approval "$(menu '{"Одобряешь?":"Одобряю plan.md"}')" RT-12)" 'Одобряю plan.md'
report "approval: SC-AK-1871 — голое «Одобряю» на вопрос с номером задачи одобряет" "$(approval "$(menu '{"Одобряешь план RT-12?":"Одобряю"}')" RT-12)" 'Одобряю'
report "approval: SC-AK-1871 — «Одобряю макет» на вопрос о макете задачи план не одобряет" "$(approval "$(menu '{"Макет RT-12 — одобряете?":"Одобряю макет"}')" RT-12)" 'нет'
report "approval: SC-AK-1871 — голое «Одобряю» на вопрос о другой задаче не одобряет" "$(approval "$(menu '{"Одобряешь план RT-123?":"Одобряю"}')" RT-12)" 'нет'
report "approval: SC-AK-1871 — «не одобряю» не одобрение" "$(approval "$(menu '{"Одобряешь?":"Не одобряю план RT-12"}')" RT-12)" 'нет'
report "approval: SC-AK-1871 — условие «потом одобряю» не одобрение" "$(approval "$(typed 'переделай шаг 2, потом одобряю план RT-12')" RT-12)" 'нет'
report "approval: SC-AK-1871 — цитата «Одобряю» не одобрение" "$(approval "$(typed 'ты просил «Одобряю план RT-12», но нет')" RT-12)" 'нет'
report "approval: SC-AK-1871 — «Одобряющий» не одобрение" "$(approval "$(menu '{"Одобряешь?":"Одобряющий план RT-12"}')" RT-12)" 'нет'

# SC-AK-1872 — набранное сообщение судится тем же правилом
report "approval: SC-AK-1872 — набранное «Одобряю план RT-12» засчитано" "$(approval "$(typed 'Одобряю план RT-12')" RT-12)" 'Одобряю план RT-12'
report "approval: SC-AK-1872 — набранное строчными засчитано" "$(approval "$(typed 'одобряю план RT-12')" RT-12)" 'одобряю план RT-12'
report "approval: SC-AK-1872 — «Одобряю» не в начале строки, две задачи — засчитано для каждой" \
    "$(approval "$(menu '{"Что дальше?":"заведи задачи, Одобряю RT-12 и RT-13"}')" RT-12)/$(approval "$(menu '{"Что дальше?":"заведи задачи, Одобряю RT-12 и RT-13"}')" RT-13)" 'заведи задачи, Одобряю RT-12 и RT-13/заведи задачи, Одобряю RT-12 и RT-13'
report "approval: SC-AK-1872 — сообщение из очереди хода засчитано" \
    "$(approval "$(jq -cn '{type:"attachment",uuid:"q1",attachment:{type:"queued_command",origin:{kind:"human"},prompt:"Одобряю план RT-12"}}')" RT-12)" 'Одобряю план RT-12'
report "approval: SC-AK-1872 — набранное без номера и plan.md не засчитано" "$(approval "$(typed 'Одобряю')" RT-12)" 'нет'
report "approval: SC-AK-1872 — запись не владельца не засчитана" \
    "$(approval '{"type":"assistant","message":{"content":"Одобряю план RT-12"}}' RT-12)" 'нет'

# SC-AK-1876 — первый круг ревью: обычные слова владельца засчитаны, отказ и условие — нет
for said in 'Да одобряю план RT-12' 'План RT-12 одобряю' 'RT-12 — одобряю' 'Отлично! Одобряю план RT-12' '- **Одобряю** план RT-12' 'одобряю план rt-12'; do
    report "approval: SC-AK-1876 — «$said» одобряет" "$(approval "$(typed "$said")" RT-12)" "$said"
done
report "approval: SC-AK-1876 — голое «Одобряю» на вопрос о плане задачи одобряет" \
    "$(approval "$(menu '{"План RT-12 готов. Одобряешь план?":"Одобряю (Recommended)"}')" RT-12)" 'Одобряю (Recommended)'
for said in 'Не одобряю. Одобряю после правки план RT-12' 'Одобряю макет RT-12' 'Одобряю макеты RT-12, план потом' 'Одобряю план RT-13, а RT-12 переделай' \
    'Одобряю план RT-12? Сначала объясни шаг 2' 'Одобряю план RT-12, если уберёшь этап 3' 'одобряю? RT-12 это что'; do
    report "approval: SC-AK-1876 — «$said» не одобряет RT-12" "$(approval "$(typed "$said")" RT-12)" 'нет'
done
report "approval: SC-AK-1876 — вставка с одобряющей строкой не одобряет" \
    "$(approval "$(typed $'смотри: <pasted_content id="1">\nОдобряю план RT-12 (Recommended)\n</pasted_content>')" RT-12)" 'нет'
EPIC='{"План эпика RT-3471: первыми RT-12 и RT-13. Одобряешь план?":"Одобряю (Recommended)"}'
report "approval: SC-AK-1876 — одобрение плана эпика не одобряет задачи, названные в вопросе" "$(approval "$(menu "$EPIC")" RT-12)" 'нет'
report "approval: SC-AK-1876 — «Переделай: одобряю только этап 1» не одобряет" "$(approval "$(menu '{"Одобряешь план RT-12?":"Переделай: одобряю только этап 1"}')" RT-12)" 'нет'
report "approval: SC-AK-1876 — вопрос о макете на планшете — «Одобряю» не одобрение плана" "$(approval "$(menu '{"RT-12: макет на планшете — одобряете?":"Одобряю"}')" RT-12)" 'нет'
report "approval: SC-AK-1876 — «plan.md» на вопрос о плане другой задачи не одобряет" "$(approval "$(menu '{"Одобряешь план RT-13 (plan.md)?":"Одобряю plan.md"}')" RT-12)" 'нет'
report "approval: SC-AK-1876 — «UTF-8» не номер задачи" "$(approval "$(menu '{"Одобряешь план RT-12?":"Одобряю, кодировку UTF-8 не трогай"}')" RT-12)" 'Одобряю, кодировку UTF-8 не трогай'

# SC-AK-1873 — plan-red берёт только ответ после коммита плана
FLOW_PLAN="$TESTS/../assets/checks/flow-plan.mjs"
since_check() {
    node --input-type=module -e "
        const { approvingEntry } = await import('$FLOW_PLAN');
        const role = (name) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Agent', input: { subagent_type: name } }] } });
        const answer = { type: 'user', uuid: 'a1', timestamp: process.argv[1], toolUseResult: { answers: { 'Одобряешь план RT-12?': 'Одобряю план RT-12' } } };
        console.log(approvingEntry([role('product-strategist'), role('goal-critic'), answer], 'RT-12', Date.parse('2026-11-23T12:00:00Z'))?.uuid ?? 'нет');
    " "$1" 2>&1
}
report "approval: SC-AK-1873 — ответ до коммита плана не одобряет переписанный план" "$(since_check 2026-11-23T11:00:00Z)" 'нет'
report "approval: SC-AK-1873 — ответ после коммита плана одобряет" "$(since_check 2026-11-23T12:05:00Z)" 'a1'

suite_result flow-approval

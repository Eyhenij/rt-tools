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

suite_result flow-approval

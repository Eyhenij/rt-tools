#!/usr/bin/env bash
# Сценарии перезарядки гейта правил.
#
# Гейт помнит загруженное правило по признаку сессии и дальше пропускает эту область молча.
# Сжатие и очистка выносят из контекста САМ ТЕКСТ правила, а признак сессии оставляют прежним:
# без перезарядки гейт продолжал бы пропускать, пока работа идёт по пересказу.
#
# Вторая половина набора — про сказанное вслух. Молчаливая перезарядка читается как поломка:
# сводка сжатия говорит, что правила загружены, гейт отвечает, что нет.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "перезарядка гейта правил"

gate_session_reset
trap gate_session_cleanup EXIT

marker="${TMPDIR}claude-skill-gate/tests.loaded"

# Вход SessionStart: признак сессии и повод запуска.
start() {
    jq -n --arg s "${1:-tests}" --arg r "${2:-compact}" '{session_id:$s,source:$r}'
}

# --- SC-AK-1049. Запись о загруженных снимается ------------------------------------------

gate_session_load agent-kit git-workflow
start tests compact | "$HOOKS/skill-gate-rearm.sh" >/dev/null 2>&1
if [ -f "$marker" ]; then got="есть"; else got="нет"; fi
report "SC-AK-1049 — после сжатия записи о загруженных нет" "$got" "нет"

gate_session_load agent-kit
start tests clear | "$HOOKS/skill-gate-rearm.sh" >/dev/null 2>&1
if [ -f "$marker" ]; then got="есть"; else got="нет"; fi
report "SC-AK-1049 — после очистки записи о загруженных нет" "$got" "нет"

# Снимается запись названной сессии, а не все подряд: на машине рядом идут чужие заходы.
gate_session_load agent-kit
: > "${TMPDIR}claude-skill-gate/чужая.loaded"
start tests compact | "$HOOKS/skill-gate-rearm.sh" >/dev/null 2>&1
if [ -f "${TMPDIR}claude-skill-gate/чужая.loaded" ]; then got="есть"; else got="нет"; fi
report "SC-AK-1049 — запись соседней сессии цела" "$got" "есть"

# --- SC-AK-1050. Перезарядка сказана вслух -----------------------------------------------

said="$(start tests compact | "$HOOKS/skill-gate-rearm.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null)"
if printf '%s' "$said" | grep -qi 'gate is armed anew\|armed anew'; then got="есть"; else got="нет"; fi
report "SC-AK-1050 — сказано, что гейт заряжен заново" "$got" "есть"

if printf '%s' "$said" | grep -qi 'load the rule'; then got="есть"; else got="нет"; fi
report "SC-AK-1050 — сказано, что делать дальше" "$got" "есть"

event="$(start tests compact | "$HOOKS/skill-gate-rearm.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.hookEventName // ""' 2>/dev/null)"
report "SC-AK-1050 — сказанное приходит полем события запуска" "$event" "SessionStart"

# Решения у перезарядки нет вовсе: она ничего не отбивает.
has_decision="$(start tests compact | "$HOOKS/skill-gate-rearm.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput | has("permissionDecision")' 2>/dev/null)"
report "SC-AK-1050 — решения в ответе нет" "$has_decision" "false"

# --- SC-AK-1050. Без признака сессии не снимается ничего ---------------------------------

gate_session_load agent-kit
printf '%s' '{"source":"compact"}' | "$HOOKS/skill-gate-rearm.sh" >/dev/null 2>&1
report "SC-AK-1050 — без признака сессии код нулевой" "$?" "0"
if [ -f "$marker" ]; then got="есть"; else got="нет"; fi
report "SC-AK-1050 — без признака сессии запись цела" "$got" "есть"

printf '' | "$HOOKS/skill-gate-rearm.sh" >/dev/null 2>&1
report "SC-AK-1050 — пустой ввод проходит" "$?" "0"

suite_result "перезарядка гейта правил"

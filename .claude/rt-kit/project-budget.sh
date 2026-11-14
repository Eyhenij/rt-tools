#!/usr/bin/env bash
# The time limits of the push set are off. The owner's word of 14.11.2026: the check is broken, push
# the branch without it. The fixed limit of a whole set (440 s) refused every branch that touches a
# root file: the set itself chose 47 steps for it, and their own limits summed to 1652 s. The step
# limits had no margin and did not depend on the volume of the change. A new check comes by its own
# task, after the owner approves its plan. The auth stand measurements of task RT-3301 (12 and 30 s
# for the stand, 34 and 44 s for its suite) stay in the history of this file for that plan.

rt_push_check_budget() {
    return 0
}

rt_push_set_budget() {
    return 0
}

rt_push_over_budget_words() {
    return 0
}

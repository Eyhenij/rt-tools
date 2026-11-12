# Scenarios — the stepper bar

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-1229 — step three of four

Given a bar of four steps with the third current
When it is drawn
Then two points are passed, the third is current and the fill takes two thirds of the bar

### SC-UKV-1230 — the label of the first step starts at the left edge

Given a bar of four steps with the first current
When it is drawn
Then the label segment is the whole bar and the label is aligned to its start

### SC-UKV-1231 — the label of the last step ends at the right edge

Given a bar of four steps with the last current
When it is drawn
Then the label segment is the whole bar and the label is aligned to its end

### SC-UKV-1232 — the label of a middle step stands in a segment centred on the share of its step

Given a bar of four steps with the third current
When it is drawn
Then the label segment starts at a third of the bar, takes two thirds and the label is centred in it

### SC-UKV-1233 — a number past the set makes the last point current

Given a bar of three steps and the current number 99
When it is drawn
Then the last point is current and the two before it are passed

### SC-UKV-1234 — a middle step near an edge takes the whole bar

Given a bar of sixteen steps
When the second step is current
Then its label takes the whole bar and is pressed to the left edge
And when the fifteenth step is current, its label is pressed to the right edge

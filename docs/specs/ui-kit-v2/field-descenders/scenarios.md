# Scenarios — the descenders of the text in a field

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec.

### SC-UKV-687 — the field line box holds the font

Given the field line height of the kit
When it is compared with the extent of the kit's font
Then the line box is at least as tall as the font's ascent and descent together

Покрытие: частичное — the spec reads the value of the token; that no tail is cut is seen on the
frame of the descenders story.

### SC-UKV-688 — a field keeps its height

Given every field at every size, before and after the edit
When its frame is compared
Then the field's box is the same height

Не покрыто: the spec environment applies no component styles; the heights are held by the frames of
the field stories, which match before and after apart from the text inside.

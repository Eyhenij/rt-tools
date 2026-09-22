# What it is carried out by — the radio button

There is no code yet, so there is not a single binding of the form `file:symbol` here: the agreement
is written before the code, and the place of execution appears together with it. Here are only the
foreseen places, so that at the merge into the domain spec it is visible where to look. The family
folder does not exist yet and is named without backticks: the address check would take it for a
dead link.

The house pattern is the checkbox of the kit — `projects/ui-kit-v2/src/lib/components/checkbox/`:
the form binding with two sources of the unavailability, the block of the kit's styles, the story
pair of the presets.

## Where execution is foreseen

| Rule                                                                                                  | Where it is foreseen                                                                                   |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| The radio button is chosen when its value is the model itself, not an equal one.                      | the component of the family, radio-button folder: the computing of the choice                          |
| A press on a radio button that is not chosen makes its value the model and gives it to the form.      | the component: the handler of the press                                                                |
| A press on the chosen radio button does not take the choice off.                                      | the component: the handler of the press                                                                |
| A value written by the form does not come back to the form as an edit.                                | the component: the writing of the value by the form                                                    |
| Any press marks the radio button touched, including one that changes nothing.                         | the component: the handler of the press                                                                |
| The radio button is unavailable when the input says so or the form says so.                           | the component: two sources, as at the checkbox                                                         |
| An unavailable radio button changes the choice neither by a press nor by a key.                       | the component: the handlers of the press and of the key                                                |
| Every press is reported outward, whether or not it changed the choice.                                | the component: the output of the press                                                                 |
| A press on the radio button does not reach the element around it.                                     | the component: the handler of the press                                                                |
| Space and Enter choose the radio button from the keyboard.                                            | the component: the handler of the key                                                                  |
| The radio button names its role, its choice and its unavailability to the assistive means.            | the component: the attributes of the host                                                              |
| The radio button is one stop of the keyboard focus, the unavailable one included.                     | the component: the attributes of the host                                                              |
| The focus reached from the keyboard is visible by the ring of the kit; the focus from a press is not. | the styles of the family: the focus-visible look                                                       |
| The label and the explanation are texts given by the caller, and each is drawn only when given.       | the template of the family                                                                             |
| The explanation is smaller than the label and drawn in the muted colour.                              | the styles of the family                                                                               |
| The card look draws a framed box with the content on the left and the circle on the right.            | the styles of the family: the card modifier                                                            |
| In the card look the frame of a chosen radio button takes the colour of the choice.                   | the styles of the family: the card modifier with the chosen one                                        |
| The unavailable radio button is dimmed as a whole and takes no pointer.                               | the styles of the family: the unavailable modifier                                                     |
| Every colour of the radio button comes from an appointment of the kit.                                | the styles of the family; held by `tools/check-preset-complete.mjs` and the literal gate of the design |

## What is covered by what

Every scenario is foreseen for the unit spec next to the component, named by its number; the look
scenarios `SC-UKV-291`…`SC-UKV-297` are confirmed besides by the showcase snapshots of the family's
stories in both presets.

## What is not decided yet

The dimming value, the measures under the material preset, the name of a radio button without a
label and the choice without a form have no place of execution until the owner answers the open
questions of the spec next to it.

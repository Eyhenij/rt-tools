## A footer button that must not exist in some state

A section of this tree. Buttons reach the footer zones by projection over an attribute, and a
conditional block around such a button loses it: a node inside `@if` does not reach the slot at
all, and one neighbouring button is left in the footer. Neither the build nor the linter judges a
conditional block — this is visible only on the assembled screen, and it was found by an
end-to-end run, not by the component spec.

So the button is not hidden but disabled:

```html
<button rt-button asidePrimary qa-dataid="invite-create-submit" type="button" [label]="submitLabel" [disabled]="issued() !== null" (click)="submit()"></button>
```

A disabled button stays an answer to the question «what can be done here»: gone after a successful
write, it reads as broken markup.

## A record that is only looked at

A section of this tree. The details panel edits nothing: it shows the record properties by a
ready-made piece from the kit, not by markup of its own. A hand-written definition list does not
happen here — `<dl>` knows neither about field widths nor about reading skeletons, and it is fixed
in every panel separately.

The panel is assembled from three kit pieces: the section `rt-aside-section` with its own heading,
the property list `rt-detail-list` and the row `rt-detail-row` — a name, a value by projection and
a skeleton for the time of the read.

```html
<rt-aside-section>
    <rt-detail-list>
        <rt-detail-row qa-dataid="postmortem-tree" [label]="treeLabel" [loading]="reading()">
            {{ entity()?.tree?.name }}
        </rt-detail-row>
    </rt-detail-list>
</rt-aside-section>

@if (!reading() && entity(); as record) {
    <rt-aside-section [heading]="textLabel">
        <pre rtElem="text" qa-dataid="postmortem-text">{{ record.text }}</pre>
    </rt-aside-section>
}
```

The reading sign comes to the aside as an input and goes into every row: the skeleton is drawn by
the kit row, and `rt-skeleton-wrapper` is not wrapped by hand. The record input accepts emptiness
too — while the read goes on there is no record yet at all, and the property names already stand
in place.

The section showing the record content hides whole for the time of the read: the former content
belongs to the former record, and the words «the record does not have this» are read by a person
as an answer that has not been given yet.

The panel has three levels of signs, each its own: the panel itself and its header carry section
marks (`<section>-details-panel`, `<section>-details-header`), a property row carries the property
mark, and the name and the value inside it are marked up by the kit (`detail-row-label`,
`detail-row-value`). The kit mark `aside-header` is one for every drawer of the application, and a
spec that needs the header of this very panel cannot hook onto it.

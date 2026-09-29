# Scenarios — the image cropper

The numbers continue the numbering of the second kit and do not change after the merge. While a
scenario is not covered, it carries the mark with the reason.

### SC-UKV-383 — the source lies whole and centred in the field

Given a source wider than the field
When the cropper is drawn
Then the whole image is visible, its proportions kept, and it is centred

### SC-UKV-384 — a photo turned by its EXIF data lies upright

Given a photo whose EXIF data says it is turned
When the cropper reads it
Then the image lies upright in the field and in the result

Не покрыто: поворот по EXIF делает браузер, а jsdom картинок не декодирует; снимок с поворотом проверяется на витрине руками.

### SC-UKV-385 — the frame starts as the largest one of its ratio

Given a source 400 by 200 and the ratio one to one
When the cropper is ready
Then the frame is 200 by 200 in the middle of the source

A free frame starts as the whole source.

### SC-UKV-386 — the frame stops at the edge of the source

Given the frame at the right edge of the source
When it is dragged further right
Then it stays at the edge

### SC-UKV-387 — the frame stops at the least size

Given the least size 50
When a handle is dragged to make the frame 10 wide
Then the frame is 50 wide

### SC-UKV-388 — a drag inside moves the frame, a handle stretches it

Given a ready frame
When the inside is dragged, and then the bottom-right handle
Then the first drag moves the frame and keeps its size
And the second stretches it with the top-left corner in place

### SC-UKV-389 — a frame with a ratio keeps it, the round look keeps one to one

Given the ratio 16 to 9, and then the round look with the same ratio
When a side handle is dragged
Then the frame keeps 16 to 9, and in the round look one to one

### SC-UKV-390 — the arrows move and stretch the frame from the keyboard

Given the focus on the frame, and then on a handle
When an arrow is pressed, and then an arrow with Shift
Then the frame moves or stretches by one pixel of the field
And with Shift by ten

### SC-UKV-391 — a finger drags the frame as the pointer does

Given a touch screen
When the frame is dragged by a finger past the field and released
Then the frame follows the finger up to the edge
And the drag ends on release

### SC-UKV-392 — one drag gives one result

Given a ready frame
When it is dragged across ten moves and released
Then the result is given once, after the release

### SC-UKV-393 — the result has the chosen format and quality in the pixels of the source

Given the format jpeg and the quality 80
When the frame is changed
Then the result is a jpeg of the frame's size in pixels of the source

Given no format and a webp source
When the frame is changed
Then the result is a webp

### SC-UKV-406 — the round look gives the square

Given the round look
When the frame is changed
Then the result is the square the frame cuts, and the circle is only on the screen

### SC-UKV-407 — a source that cannot be read gives the refusal

Given a file that is not an image
When the cropper reads it
Then the refusal text is shown and there is no frame
And the caller is told by an output

### SC-UKV-408 — an unavailable cropper keeps its frame

Given an unavailable cropper
When the frame is dragged and an arrow is pressed
Then the frame stays where it was and no result is given

### SC-UKV-409 — the frame and the handles have names

Given a ready frame
When the assistive means read it
Then the frame and each of the eight handles carry a name from the kit's labels

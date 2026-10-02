# Scenarios — the image uploader

The numbers continue the numbering of the second kit and do not change after the merge. While a
scenario is not covered, it carries the mark with the reason.

### SC-UKV-507 — the place shows one state at a time

Given an image and a chosen source
When the uploader is drawn
Then only the cropper is seen, and neither the picture nor the drop zone

### SC-UKV-508 — the empty uploader is the drop zone

Given neither an image nor a source
When the uploader is drawn
Then the drop zone with the button to choose is seen

### SC-UKV-509 — a chosen or dropped image opens the cropper

Given the drop zone
When an image file is dropped on it
Then the cropper opens in the same place with that file

A dropped file that is not an image leaves the drop zone as it was.

### SC-UKV-510 — «Apply» makes the result the image

Given the cropper has given a result
When «Apply» is pressed
Then the picture of the result stands in the place, and the application gets the file

### SC-UKV-511 — «Cancel» returns the place

Given an image and the cropper opened over another file
When «Cancel» is pressed
Then the former picture stands in the place, and the application gets nothing

### SC-UKV-512 — auto apply applies every result

Given auto apply
When the cropper gives a result
Then there are no buttons, and the application gets the file at once

### SC-UKV-513 — a press on the image chooses another file

Given the picture in the place
When it is pressed, or Enter is pressed on it
Then the file choice opens, and the picture carries the hint of the action

### SC-UKV-514 — download saves the image

Given the picture and the download button asked for
When the button is pressed
Then the current image is saved under the file name

### SC-UKV-518 — the download button lies over the corner, round or square

Given the picture and the download button asked for
When the application asks for no form, or for the square one
Then the button is round, or square, and it reaches past the picture's top right edges

### SC-UKV-515 — an unavailable uploader changes nothing

Given an unavailable uploader
When its picture is pressed
Then no file choice opens

### SC-UKV-516 — loading shows the spinner

Given the application loads
When the uploader is drawn
Then the kit's spinner stands in the place

### SC-UKV-517 — the texts are the kit's labels

Given the uploader without texts of the application
When the drop zone and the image are drawn
Then the line, the button and the hint are the kit's labels, and the application's hint replaces the kit's one

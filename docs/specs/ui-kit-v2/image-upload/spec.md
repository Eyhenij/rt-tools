# The image uploader

**Status:** in force · **Revision:** 30 September 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the image cropper — it cuts the chosen file; the drop zone and the empty state of the
kit — the empty uploader is built of them; the labels of the kit — every text of the uploader is its
key
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-1881 of epic RT-2353 before the code. The
owner put it into the branch of the cropper, RT-2397, on 29 September 2026.

## Why

The first kit has an uploader of one image: a logo, an avatar, a cover. It holds one place on the
screen, and that place changes with the state. The owner showed how an application uses it: the
applied picture stands in place of the drop zone, a press on it chooses another file, and a chosen
file opens the cropper. The second kit gets the same uploader, built on its own cropper.

## Terminology

| Term       | What it is                                                              |
| ---------- | ----------------------------------------------------------------------- |
| the place  | the box of the component; one state at a time lives in it               |
| the image  | the address of the current picture, given by the application or applied |
| the source | the file a person chose or dropped; the cropper cuts it                 |
| applying   | the cut file becomes the image and leaves for the application           |
| auto apply | every result of the cropper is applied at once, without the two buttons |

### What it is called in the interface

| In the agreement | On the screen                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------- |
| the drop zone    | a dashed frame with a cloud, a line of text and a button to choose                        |
| the cropper      | the image with the frame, and the buttons «Cancel» and «Apply» under it                   |
| the image        | the picture itself; a hint names what a press does                                        |
| download         | a small button with an arrow down over the top right corner of the picture, past its edge |

## Rules

- **The place shows one state: loading, the cropper, the image or the drop zone.** A source outweighs
  the image, and the image outweighs the drop zone.
- **Without an image and a source the place is the drop zone.** A file is chosen by its button or
  dropped on it.
- **A chosen or dropped image file opens the cropper in the same place.** A dropped file of another
  type is ignored.
- **«Apply» makes the last result the image and gives the file to the application.** The cropper
  leaves, and the new picture stands in its place.
- **«Cancel» drops the source and returns the place to what it was.** The image stays the one before
  the choice, and the application is given nothing.
- **With auto apply there are no buttons, and every result of the cropper is applied at once.**
- **A press on the image chooses another file.** Enter and Space do the same, and a hint names the
  action.
- **The download button saves the current image under the file name.** It is shown only where the
  application asked for it.
- **The download button reaches past the picture's top right corner, round or square.** It lies
  over the edge as in the first kit. Round is the default, and the application may ask for square.
- **An unavailable uploader changes nothing.** The drop zone takes no files, the image takes no press,
  and download stays.
- **While the application loads, the place shows the kit's spinner.**
- **Every text of the uploader is a key of the kit's labels.** The hint over the image may be the
  application's own text.

## What is out of scope

- Several images at once and a gallery — that is `rt-file-input` with a list.
- Sending the file anywhere — the application does it with the file it was given.
- The first kit's uploader — the first kit is not edited.

## Contract

Not applicable: the family calls no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable: the uploader keeps nothing. An address it made for an applied file it releases when
the image is replaced or the component goes away.

## Screens and states

| State       | What is seen                                              |
| ----------- | --------------------------------------------------------- |
| empty       | the drop zone                                             |
| cropping    | the cropper, «Cancel» and «Apply» under it                |
| image       | the picture; the download button in its corner when asked |
| loading     | the kit's spinner                                         |
| unavailable | as empty or image, taking no files and no press           |

## Cross-cutting requirements

### Locales

The line of the drop zone, the button to choose, the hint over the image, «Cancel», «Apply» and the
download button are keys of the kit's labels in the `rtKit` namespace. The kit carries the English
default, and the showcase carries the Russian set.

### SEO

Not applicable.

### Mobile layout

The place takes the width of its box, and the cropper in it is the same one a finger drags.

### Several objects

Not applicable.

## Decisions

- **One place with changing states, not the result under the zone.** The owner asked for the first
  kit's behaviour; a picture under a zone that stays reads as two controls.
- **The image is an address, not a file.** The application usually has an address from its storage.
  It gets a file by the output, and the address of an applied file the uploader makes itself.

## Open questions

None.

## History of changes

- 29 September 2026 — the agreement was written before the code, in the branch of RT-2397 at the
  owner's word.
- 30 September 2026 — the download button reaches past the picture's corner and is round or
  square. Task RT-2436, at the owner's word.

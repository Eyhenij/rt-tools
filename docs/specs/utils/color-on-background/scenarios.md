# Scenarios — the text colour on a background

The numbers were issued as the next free ones of the prefix and do not change: the titles of the
tests refer to them.

### SC-UT-1 — white text on a dark background

Given a dark background, such as `#1f2937` or `#000`
When the text colour is asked for it
Then it is `#fff`

### SC-UT-2 — darkened text on a light background

Given a light background, such as `#ffffff` or `#facc15`
When the text colour is asked for it
Then it is the background darkened by half: `#7f7f7f` and `#7d660a`

### SC-UT-3 — a short and a bare colour are read in full

Given `#fff`, `fff` and `ffffff`
When the text colour and a darkening by half are asked for each
Then all three answer as `#ffffff`

### SC-UT-4 — a value that is not a colour

Given `red`, an empty string and `#12345`
When the text colour and a darkening are asked for each
Then the text colour is `#fff`, and the darkening returns the value as it came

### SC-UT-5 — the first kit's answers are kept

Given six-digit colours with `#` across the range
When both functions answer
Then the answers equal the first kit's functions on the same colours

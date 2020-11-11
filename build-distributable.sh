#!/bin/bash

# Concatenates What's source files into a single distributable file.

DIRECTORY="./distributable/"
FILENAME="what.js"
VERSION="alpha live"

SOURCE_FILES=("./src/what/what.js"
              "./src/what/canvas-spectrogram.js"
              "./src/what/vue-ui.js"
              "./src/what/initialize.js")

echo "// WHAT: Concatenated JavaScript source files" > "$DIRECTORY/$FILENAME"
echo "// PROGRAM: What?" >> "$DIRECTORY/$FILENAME"
echo "// VERSION: $VERSION (`LC_ALL=en_US.utf8 date -u +"%d %B %Y %H:%M:%S %Z"`)" >> "$DIRECTORY/$FILENAME"
echo "// AUTHOR: Tarpeeksi Hyvae Soft" >> "$DIRECTORY/$FILENAME"
echo "// LINK: https://www.github.com/leikareipa/luujanko/" >> "$DIRECTORY/$FILENAME"
echo "// FILES:" >> "$DIRECTORY/$FILENAME"
printf "//\t%s\n" "${SOURCE_FILES[@]}" >> "$DIRECTORY/$FILENAME"
echo -e "/////////////////////////////////////////////////\n" >> "$DIRECTORY/$FILENAME"

cat ${SOURCE_FILES[@]} >> "$DIRECTORY/$FILENAME"

# Remove empty lines
sed -i '/^[[:space:]]*$/d' "$DIRECTORY/$FILENAME"

# Trim whitespace.
sed -i 's/^[[:blank:]]*//;s/[[:blank:]]*$//' "$DIRECTORY/$FILENAME"

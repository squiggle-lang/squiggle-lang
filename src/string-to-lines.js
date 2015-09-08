function stringToLines(text) {
    var lines = text.split(/\r?\n/);
    // Files should end with newlines, but not everyone obeys this convention,
    // so we only remove the last line if it's empty, meaning the file ended
    // correctly with just a newline.
    if (lines[lines.length - 1] === "") {
        lines.pop();
    }
    return lines;
}

module.exports = stringToLines;

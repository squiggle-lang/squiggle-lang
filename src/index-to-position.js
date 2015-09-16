function indexToPosition(text, index) {
    if (typeof index !== "number") {
        throw new Error("index must be a number");
    }
    if (index < 0) {
        throw new Error("index must be non-negative");
    }
    if (index >= text.length) {
        throw new Error("index too large: " + index + " >= " + text.length);
    }
    var line = 1;
    var column = 1;
    var i = 0;
    while (i !== index) {
        if (text.charAt(i) === "\n") {
            // Unix newline
            line++;
            column = 1;
            i++;
        } else if (text.charAt(i) === "\r" && text.charAt(i + 1) === "\n") {
            // Windows newline
            line++;
            column = 1;
            i += 2;
        } else {
            column++;
            i++;
        }
    }
    return {line: line, column: column};
}

module.exports = indexToPosition;

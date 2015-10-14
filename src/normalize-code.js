function normalizeCode(code) {
    return code
        // Replace Windows CRLF with just LF
        .replace(/\r\n/g, "\n")
        // Replace Mac OS 9 CR with LF
        .replace(/\r/g, "\n")
}

module.exports = normalizeCode;

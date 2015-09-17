var words = require("./js-reserved-words");

var regex = new RegExp("^(?:" + words.join("|") + ")$");

function isJsReservedWord(s) {
    return regex.test(s);
}

module.exports = isJsReservedWord;

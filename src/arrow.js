// Draws an arrow using text that is `n` characters long. It points above.
// Example:
//
// LOREM IPSUM DOLOR SIT AMET
// ------------^
//
// The little point arrow with line thing is what this function generates.
// Useful for showing error context in command line output.

var SHAFT = "-";
var TIP = "^";

function arrow(n) {
    var s = "";
    var m = n - 1;
    while (m > 0) {
        s += SHAFT;
        m--;
    }
    s += TIP;
    return s;
}

module.exports = arrow;

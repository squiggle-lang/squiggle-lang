var chalk = require("chalk");

var argv = argv;
var ERROR = chalk.bold.red;

function die() {
    var msg = [].join.call(arguments, " ");
    console.error(ERROR(msg));
    if (argv !== undefined && !argv.interactive) {
        process.exit(1);
 	}
}

module.exports = die;

const { findError } = require("./matcher");
const { formatError } = require("./formatter");
const chalk = require("chalk");

process.on("uncaughtException", (err) => {
  // Use the message for the search
  const { count, matches } = findError(err.message);
  
  if (count > 0) {
    console.log(chalk.cyan(`\n💡 ErrLens detected ${count} issue(s):`));
    matches.forEach(match => console.log(formatError(match)));
  } else {
    // If no match, show the raw error so you know what happened
    console.error(chalk.red.bold("\n--- Raw System Error ---"));
    console.error(err);
  }
  process.exit(1);
});
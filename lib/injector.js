const { findError } = require("./matcher");
const { formatError } = require("./formatter");
const chalk = require("chalk");

/**
 * ERR_LENS INJECTOR
 * Attach this to any project to get automatic analysis on crash.
 */
process.on("uncaughtException", (err) => {
  // We search the stack trace because sometimes the match string 
  // is hidden deep in the error history.
  const errStr = err !== null && typeof err === "object" ? (err.stack || err.message) : String(err ?? "unknown error");
  const { count, matches } = findError(errStr);
  
  if (count > 0) {
    console.log(chalk.cyan.bold(`\n💡 ErrLens Runtime Analysis (${count} Issues Found):`));
    matches.forEach(match => console.log(formatError(match)));
  } else {
    // If we don't know the error, show the original one so the dev isn't lost
    console.error(chalk.red.bold("\n--- Raw System Error ---"));
    console.error(err);
  }

  // Always exit with failure code 1 after a crash
  process.exit(1);
});

// Also handle Unhandled Promise Rejections (Async/Await errors)
process.on("unhandledRejection", (reason) => {
    const reasonStr = reason !== null && typeof reason === "object" ? (reason.stack || reason.message) : String(reason ?? "unknown error");
    const { count, matches } = findError(reasonStr);
    
    if (count > 0) {
      console.log(chalk.magenta.bold(`\n📡 ErrLens Async Error Detection:`));
      matches.forEach(match => console.log(formatError(match)));
    } else {
      console.error(chalk.red.bold("\n--- Unhandled Async Rejection ---"));
      console.error(reason);
    }
    process.exit(1);
});

console.log(chalk.dim("🔧 ErrLens Protection Enabled."));
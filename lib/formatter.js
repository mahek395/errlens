const chalk = require("chalk");
const boxen = require("boxen");

function formatError(error) {
  const fixList = error.fixes.map(f => chalk.green(`  ✔ ${f}`)).join("\n");

  const content = `
${chalk.cyan.bold("ID:")} ${error.name}

${chalk.yellow.bold("🔍 WHAT:")} ${error.explanation}
${chalk.magenta.bold("💥 WHY:")} ${error.why}

${chalk.green.bold("✅ FIXES:")}
${fixList}

${chalk.blue.bold("📘 EXAMPLE:")}
${chalk.gray(error.example)}
  `;

  return boxen(content, {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: "round",
    borderColor: "cyan",
    title: chalk.bold("🔍 ErrLens Analysis"),
    titleAlignment: "left",
    width: 80 // Fixed width for consistent professional look
  });
}

module.exports = { formatError };
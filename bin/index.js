#!/usr/bin/env node

const { Command } = require("commander");
const { spawn } = require("child_process");
const ora = require("ora").default; 
const chalk = require("chalk");
const path = require("path");
const { findError } = require("../lib/matcher");
const { formatError } = require("../lib/formatter");

const program = new Command();

program
  .name("errlens")
  .description("Professional JS Error Analytics")
  .version("1.3.1");

// ----------------- RUN COMMAND -----------------
program
  .command("run <file>")
  .option('--json', 'Output JSON instead of pretty UI')
  .description("Run a Javascript file and analyze crashes")
  .action((file, options) => {
    const filePath = path.resolve(process.cwd(), file);
    const spinner = ora(`Running ${chalk.yellow(file)}...`).start();

    const child = spawn(process.execPath, [filePath], { stdio: ["inherit", "pipe", "pipe"] });

    let errorOutput = "";

    // Stream logs to terminal in real-time
    child.stdout.on("data", (data) => {
      spinner.stop();
      process.stdout.write(data);
      spinner.start();
    });

    // Capture stderr for analysis
    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    child.on("close", (code, signal) => {
      spinner.stop();

      if (code === null) {
        console.log(chalk.red.bold(`\n⚠️ Process killed by signal: ${signal}`));
        process.exit(1);
        return;
      }

      if (code === 0) {
        if (options.json) {
          console.log(JSON.stringify({ code, count: 0, matches: [] }, null, 2));
        } else {
          console.log(chalk.green.bold("\n✨ Process finished successfully."));
        }
      } else {
        const { count, matches } = findError(errorOutput);

        if (options.json) {
          // JSON output only
          console.log(JSON.stringify({ code, count, matches }, null, 2));
        } else if (count > 0) {
          console.log(chalk.bold.cyan(`\n🚀 ErrLens Analysis (${count} Issue(s)):`));
          matches.forEach(m => console.log(formatError(m))); // Pretty UI only here
        } else {
          console.log(chalk.red.bold("\n❌ Crash detected (No known fix in database):"));
          console.log(chalk.gray(errorOutput));
        }
      }

      process.exit(code ?? 1);
    });

    child.on("error", (err) => {
      spinner.fail(chalk.red(`System Error: ${err.message}`));
      process.exit(1);
    });
  });

// ----------------- ANALYZE COMMAND -----------------
program
  .arguments("<errorString>") // default command if no "run"
  .description("Analyze a specific error string")
  .option('--json', 'Output result in JSON format')
  .action((errorString, options) => {
    const { count, matches } = findError(errorString);

    if (options.json) {
      console.log(JSON.stringify({ code: count > 0 ? 1 : 0, count, matches }, null, 2));
      process.exit(count > 0 ? 1 : 0); // CI fails if issues found
      return;
    }

    if (count > 0) {
      console.log(chalk.bold.cyan(`\n🚀 ErrLens Analysis (${count} Issue(s)):`));
      matches.forEach(m => console.log(formatError(m))); // Pretty UI
    } else {
      console.log(chalk.red.bold("\n❌ Crash detected (No known fix in database):"));
      console.log(chalk.gray(errorString));
    }
  });

// ----------------- PARSE ARGUMENTS -----------------
program.parse(process.argv);
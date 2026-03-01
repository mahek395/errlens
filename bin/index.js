#!/usr/bin/env node

const { Command } = require("commander");
const { spawn } = require("child_process");
const ora = require("ora");
const chalk = require("chalk");
const path = require("path");
const { findError } = require("../lib/matcher");
const { formatError } = require("../lib/formatter");

const program = new Command();

program
  .name("errlens")
  .description("Professional JS Error Analytics")
  .version("1.3.1");

program
  .command("run <file>")
  .description("Run a Javascript file and analyze crashes")
  .action((file) => {
    const filePath = path.resolve(process.cwd(), file);
    const spinner = ora(`Running ${chalk.yellow(file)}...`).start();
    
    // stdio: ['inherit', 'pipe', 'pipe'] 
    // This allows us to pipe stdout and stderr while keeping the process interactive
    const child = spawn("node", [filePath]);

    let errorOutput = "";

    // Stream logs to terminal in REAL-TIME
    child.stdout.on("data", (data) => {
      // Clear spinner temporarily to print log, then restart (better UX)
      spinner.stop();
      process.stdout.write(data);
      spinner.start();
    });

    // Capture stderr for analysis
    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    child.on("close", (code) => {
      spinner.stop();
      
      if (code === 0) {
        console.log(chalk.green.bold("\n✨ Process finished successfully."));
      } else {
        const { count, matches } = findError(errorOutput);

        if (count > 0) {
          console.log(chalk.bold.cyan(`\n🚀 ErrLens Analysis (${count} Issue(s)):`));
          matches.forEach(m => console.log(formatError(m)));
        } else {
          console.log(chalk.red.bold("\n❌ Crash detected (No known fix in database):"));
          console.log(chalk.gray(errorOutput));
        }
      }
      process.exit(code);
    });

    child.on("error", (err) => {
      spinner.fail(chalk.red(`System Error: ${err.message}`));
    });
  });

program.parse(process.argv);
#!/usr/bin/env bun
/**
 * Not used at the moment, was just playing around with the idea of using the bun JavaScript API to build the project.
 */
import { Command } from 'commander';
import { build, type BuildConfig } from 'bun';
import concurrently from 'concurrently';

// Initialize Commander to handle CLI commands and options
const program = new Command();

// Paths and base TypeScript compilation command
const srcFile = 'src/index.ts';
const outDir = 'out';
const tscBaseCmd = 'tsc --emitDeclarationOnly --project tsconfig.json';

/**
 * Handles the build process with optional watch and type emission.
 * 
 * @param options - Object containing flags for watch, packages, noCheck, and typesOnly.
 */
async function runBuild(options: {
    watch?: boolean;
    packages?: boolean;
    noCheck?: boolean;
    typesOnly?: boolean;
}) {
    // Handle TypeScript-only builds (e.g., for emitting declaration files without bundling)
    if (options.typesOnly) {
        // Construct the TypeScript command dynamically based on flags
        const tscCmd = `${tscBaseCmd}${options.noCheck ? ' --noCheck' : ''}${options.watch ? ' --watch' : ''}`;

        // Run TypeScript compilation (watch mode if specified)
        await Bun.spawn(tscCmd.split(' ')).exited;
        return;  // Exit early since no Bun build is needed for types-only mode
    }

    // Define options for the Bun build process
    const buildOptions: BuildConfig = {
        entrypoints: [srcFile],
        outdir: outDir,
        drop: ['console', 'debugger'],  // Strip console and debugger statements
        packages: options.packages ? 'external' : undefined
    };

    // Handle watch mode: run both TypeScript and Bun build concurrently
    if (options.watch) {
        concurrently([
            {
                // Run TypeScript watch for continuous type emission
                command: `${tscBaseCmd} --watch${options.noCheck ? ' --noCheck' : ''}`,
                name: 'tsc',  // Label the TypeScript process for logging
            },
            {
                // Run Bun build in watch mode
                command: `bun build ${srcFile} --outdir ${outDir} ${
                    options.packages ? '--packages external' : ''
                } ${options.noCheck ? '--noCheck' : ''} --watch`,
                name: 'bun',  // Label the Bun process for logging
            },
        ], {

        });
    } else {
        // Non-watch mode: Run TypeScript once, then trigger Bun build
        await Bun.spawn(tscBaseCmd.split(' ')).exited;

        // Perform a standard Bun build
        await build(buildOptions);
        console.log(`Build completed.`);
    }
}

// Register the build command and attach optional flags
program
    .command('build')
    .description('Build project with options')
    .option('--watch', 'Watch for changes and rebuild')
    .option('--packages', 'Bundle external packages')
    .option('--nocheck', 'Skip type checking')
    .option('--types-only', 'Emit types without compiling the project')
    .action((opts) => {
        runBuild({
            watch: opts.watch,
            packages: opts.packages,
            noCheck: opts.nocheck,
            typesOnly: opts.typesOnly,
        });
    });

// Parse and execute CLI input
program.parse();
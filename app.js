#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander = require("commander");
//import * as shelljs from 'shelljs';
//import { JsDALConfig  } from './jsdal-config';
var main_1 = require("./main");
var program = commander;
program
    .version('0.0.1')
    .usage('[options] <file ...>')
    .option('-p, --peppers', 'Add peppers')
    .option('-P, --pineapple', 'Add pineapple')
    .option('-b, --bbq-sauce', 'Add bbq sauce')
    .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble');
program
    .command('init')
    .description('Initialises a new jsdal.config file')
    .action(function () {
    console.log('TODO - INIT!');
    // this config can host the check timeouts (check every (x) seconds ...)
});
// var outputBuffer = new clui.LineBuffer({
//     x: 0,
//     y: 0,
//     width: 'console',
//     height: 'console'
// });
// var headers = new clui.Line(outputBuffer)
//     .padding(2)
//     .column(chalk.red('Column One'), 20)
//     .column('Column Two', 20)
//     .column('Column Three', 20)
//     .column('Column Four', 20)
//     .fill()
//     .store();
// var line;
// for (var l = 0; l < 20; l++) {
//     line = new clui.Line(outputBuffer)
//         .column("AaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbaaaZ", 20)
//         .column((Math.random() * 100).toFixed(3), 20)
//         .column((Math.random() * 100).toFixed(3), 20)
//         .column((Math.random() * 100).toFixed(3), 11)
//         .fill()
//         .store();
// }
// outputBuffer.output();
// var questions = [
//     {
//         name: 'username',
//         type: 'input',
//         message: 'Enter your Github username or e-mail address:',
//         validate: function (value) {
//             if (value.length) {
//                 return true;
//             } else {
//                 return 'Please enter your username or e-mail address';
//             }
//         }
//     },
//     {
//         name: 'password',
//         type: 'password',
//         message: 'Enter your password:',
//         validate: function (value) {
//             if (value.length) {
//                 return true;
//             } else {
//                 return 'Please enter your password';
//             }
//         }
//     }
// ];
/*
inquirer.prompt(questions).then(() => {
    console.dir(arguments);

});*/
// inquirer.prompt([
//   {
//     type: 'expand',
//     message: 'Conflict on `file.js`: ',
//     name: 'overwrite',
//     choices: [
//       {
//         key: 'y',
//         name: 'Overwrite',
//         value: 'overwrite'
//       },
//       {
//         key: 'a',
//         name: 'Overwrite this one and all next',
//         value: 'overwrite_all'
//       },
//       {
//         key: 'd',
//         name: 'Show diff',
//         value: 'diff'
//       },
//       new inquirer.Separator(),
//       {
//         key: 'x',
//         name: 'Abort',
//         value: 'abort'
//       }
//     ]
//   }
// ]).then(function (answers) {
//   console.log(JSON.stringify(answers, null, '  '));
// });
//return;
/*
    command/option ideas
    ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯

    dal/create/new    : create a new DAL.jsDAL file with prompts for different options (e.g. serverUrl)
    live/watch        : continuous run..(otherwise its just a single run that exists after one iteration)
    -log-level        : determines light vs verbose logging?
*/
program.parse(process.argv);
if (program.peppers)
    console.log('  - peppers2');
var log = console.log;
process.on('uncaughtException', function (error) {
    console.error(error);
});
/*
{

    "ProjectList": [{
        "Name": "vZero",
        "Guid": "ab0f25d7-9bdf-4703-9ee8-33bbdecd1493",
        "Included": true,
        "Sources": [{
            "Name": "MainDB",
            "Guid": "73f4e392-d618-45f1-9174-06e70212fc13",
            "Files": [{
                "Filename": "General.js",
                "Guid": "ad682c02-2e3d-4e7b-88f2-7cf54d48dbbc",
                "Version": 101
            }]
        }]
    }]
}*/
// TODO: FETCH PROJECT LIST DYNAMICALLY...DO NOT DEPENDENT ON .jsdal FILE ... 
try {
    main_1.Main.init();
}
catch (e) {
    console.error(e);
}
//# sourceMappingURL=F:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal-cli/app.js.map
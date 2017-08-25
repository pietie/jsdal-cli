import { JsDALConfig } from "./jsdal-config";

import * as chalk from 'chalk';
import * as moment from 'moment';

export class ExpireByLogEntry {
    expireBy: moment.Moment;
    line: string;
}

export class ConsoleLog {
    private static MAX_LENGTH: number = 20;

    private static projects: { [key: string]: JsDALConfig } = {};
    private static expireByLog: ExpireByLogEntry[] = [];
    private static mainLog: string[] = [];

    static clearScreen() {
        process.stdout.write('\x1B[2J\x1B[0f');
    }

    static addProject(filePath: string, config: JsDALConfig) {
        ConsoleLog.projects[filePath] = config;
    }

    static logExpireBy(line: string, expireInMins: number) {
        let entry: ExpireByLogEntry = new ExpireByLogEntry();
        let now = moment();

        entry.expireBy = now.clone().add(<any>expireInMins * 60.0, 's');
        entry.line = chalk.grey('  [' + moment().format('HH:mm:ss') + '] ') + line;

        ConsoleLog.expireByLog.push(entry);
    }

    static log(line: string) {
        ConsoleLog.mainLog.splice(0, 0, chalk.grey('  [' + moment().format('HH:mm:ss') + '] ') + line);

        if (ConsoleLog.mainLog.length > ConsoleLog.MAX_LENGTH) {

            ConsoleLog.mainLog = ConsoleLog.mainLog.slice(0, ConsoleLog.MAX_LENGTH);
            //ConsoleLog.mainLog.splice(ConsoleLog.mainLog.length - ConsoleLog.MAX_LENGTH + 1);

        }
    }

    static output() {
        //!console.log(`\t${chalk.green(filePath)} (${chalk.bgWhite.blue(config.jsDALServerUrl)})`);
        ConsoleLog.clearScreen();

        // clean-up expireByLog
        let now = moment();
        let expiredLines = [];

        ConsoleLog.expireByLog.forEach(expireByLine => {
            if (now > expireByLine.expireBy) {
                expiredLines.push(expireByLine);
            }
        });

        expiredLines.forEach(l => {
            let i = ConsoleLog.expireByLog.indexOf(l);
            ConsoleLog.expireByLog.splice(i, 1);
        });

        //ConsoleLog.expireByLog.splice

        Object.keys(ConsoleLog.projects).forEach(filePath => {
            let config = this.projects[filePath];

            let statusTxt: string = '(UNKNOWN)';

            if (config.lastStatus) {
                statusTxt = `${config.lastStatus.status} - ${config.lastStatus.lastChecked.fromNow()}`;
            }

            console.log(`\t${chalk.green(filePath)} (${chalk.bgWhite.blue(config.jsDALServerUrl)})\tSTATUS=${statusTxt}`);
        });

        if (ConsoleLog.expireByLog.length > 0) {
            console.log('\r\n\r\n');
            ConsoleLog.expireByLog.forEach(expireByLine => {
                console.log(expireByLine.line);
            });

        }

        console.log('\r\n\r\n');

        ConsoleLog.mainLog.forEach(line => {

            console.log(line);

        });


    }

}

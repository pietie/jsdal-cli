import * as chalk from 'chalk';

import { JsDALDbSource } from './JsDALDbSource'
import { ISerializable } from '~/ISerializable'
import { Util  } from '../Util'
import { ConsoleLog } from "./../console-logger";


export class JsDALProject implements ISerializable<JsDALProject> {
    Name: string;
    Guid: string;
    Sources: JsDALDbSource[];

    deserialize(src: JsDALProject) {
        this.Name = src.Name;
        this.Guid = src.Guid;

        this.Sources = [];

        if (src.Sources) {
            this.Sources = src.Sources.map(s => {

                let dbSource = new JsDALDbSource();

                return dbSource.deserialize(s);
            });
        }

        return this;
    }

    public updateFrom(newDBSources: JsDALDbSource[]) {

        if (!newDBSources) return;
        if (!this.Sources) this.Sources = [];

        let curSourceCnt = this.Sources.length;
        let curSources = this.Sources.map(e => e.Name).join(",");

        // remove current DB Sources that do not exist in new list
        let toRemove = this.Sources.filter(existing => newDBSources.find(n => n.Guid == existing.Guid) == null);

        // filter out those items that need to be removed!
        this.Sources = this.Sources.filter(existing => { return toRemove.indexOf(existing) == -1; });

        // add all new DB sources
        newDBSources = newDBSources.filter(newSrc => this.Sources.find(existing => existing.Guid == newSrc.Guid) == null);

        let projName: string = chalk.bgBlue.yellow(Util.padRight(this.Name, 20));

        if (toRemove.length > 0 || newDBSources.length > 0) {
            ConsoleLog.logExpireBy(projName + chalk.gray(`CUR sources (${curSourceCnt}): `) + curSources, 0.3);
        }
        if (newDBSources.length > 0) {
            ConsoleLog.logExpireBy(projName + chalk.green(`ADD sources (${newDBSources.length}): `) + newDBSources.map(e => e.Name).join(","), 0.3);
        }
        if (toRemove.length > 0) {
            ConsoleLog.logExpireBy(projName + chalk.red(`REM sources (${toRemove.length}): `) + toRemove.map(e => e.Name).join(","),0.3);
        }
        if (toRemove.length > 0 || newDBSources.length > 0) {
            // add extra newline at the end if there was any output above
            //console.log("");
        }


        this.Sources = this.Sources.concat(newDBSources);
    }
}
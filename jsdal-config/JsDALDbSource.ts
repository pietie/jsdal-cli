import * as chalk from 'chalk';

import { JsDALFile } from './JsDALFile'
import { ISerializable } from '../ISerializable'

import { Util  } from '../Util'


export class JsDALDbSource implements ISerializable<JsDALDbSource> {
    Name: string;
    Guid: string;
    JsFiles: JsDALFile[];

    deserialize(src: JsDALDbSource) {
        this.Name = src.Name;
        this.Guid = src.Guid;
        this.JsFiles = [];

        if (src.JsFiles) {
            this.JsFiles = src.JsFiles.map(f => {

                let jsFile = new JsDALFile();

                return jsFile.deserialize(f);

            });
        }

        return this;
    }

    static deserializeSingle(input: JsDALDbSource): JsDALDbSource {
        let dbs = new JsDALDbSource();

        dbs.deserialize(input);

        return dbs;
    }

    static deserialize(input: JsDALDbSource[]): JsDALDbSource[] {
        let ar: JsDALDbSource[] = [];

        input.forEach(e => {
            ar.push(JsDALDbSource.deserializeSingle(e));
        });

        return ar;
    }

    public updateFilesFrom(dbSource: JsDALDbSource, newFiles: JsDALFile[]) {


        if (!newFiles) return;
        if (!this.JsFiles) this.JsFiles = [];

        let dbSourceName: string = "\t" 
                + chalk.bgCyan.black(Util.padRight(dbSource.Name, 15));

        let curCnt = this.JsFiles.length;
        let curFiles = this.JsFiles.map(e => e.Filename).join(",");

        // remove current JS Files that do not exist in new list
        let toRemove = this.JsFiles.filter(existing => newFiles.find(n => n.Guid == existing.Guid) == null);

        // filter out those items that need to be removed!
        this.JsFiles = this.JsFiles.filter(existing => { return toRemove.indexOf(existing) == -1; });

        // add all new Js Files
        newFiles = newFiles.filter(newSrc => this.JsFiles.find(existing => existing.Guid == newSrc.Guid) == null);

        if (newFiles.length > 0 || toRemove.length > 0) {
            console.log(dbSourceName + chalk.gray(`CUR files (${curCnt}): `) + curFiles);
        }

        if (newFiles.length > 0) {
            console.log(dbSourceName + chalk.green(`ADD files (${newFiles.length}): `) + newFiles.map(e => e.Filename).join(","));
        }

        if (toRemove.length > 0) {
            console.log(dbSourceName + chalk.red(`REM files (${toRemove.length}): `) + toRemove.map(e => e.Filename).join(","));
        }
        if (toRemove.length > 0 || newFiles.length > 0) {
            // add extra newline at the end if there was any output above
            console.log("");
        }


        this.JsFiles = this.JsFiles.concat(newFiles);

    }
}
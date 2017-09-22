import { jsDALServerApi, IApiResponse } from './jsDALServerApi';
import { JsDALConfig, JsDALProject, JsDALDbSource, JsDALFile } from './jsdal-config';

import { ConsoleLog } from './console-logger';


import * as commander from 'commander';
import * as inquirer from 'inquirer';

import * as clui from 'clui';

import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto'
import * as async from 'async';
import * as chalk from 'chalk';
import * as shelljs from 'shelljs';

import { Util } from './util'


export class Main {

    configs: JsDALConfig[];

    public static async init() {
        let main = new Main();

        main.main();
    }


    async enumerateJsDalFiles(): Promise<JsDALConfig[]> {
        return new Promise<any>(async (resolve, reject) => {

            let folder = './';

            let configs: JsDALConfig[] = [];

            fs.readdir(folder, (err, files) => {
                var jsDALFiles = files.filter(f => f.endsWith(".jsDAL"));

                ConsoleLog.log(chalk.grey(`Found (${jsDALFiles.length}) .jsDAL file(s) in the current directory.`));

                jsDALFiles.forEach(filePath => {

                    try {
                        let data: string = fs.readFileSync(filePath, "utf8");

                        let config: JsDALConfig = new JsDALConfig().deserialize(JSON.parse(data));


                        config.ConfigFilePath = path.resolve(filePath);

                        ConsoleLog.addProject(filePath, config);

                        configs.push(config);
                    }
                    catch (e) {
                        console.log(chalk.red(`Failed to JSON.parse "${filePath}" with error:`));
                        console.log(chalk.red(e.toString()));
                    }

                });

                resolve(configs);
            });

        });
    }


    private async main() {
        try {


            this.configs = await this.enumerateJsDalFiles();

            // TODO: Retrieve project list from server!!!?



            async.forEach(this.configs, (conf: JsDALConfig) => {

                jsDALServerApi.getProjects(conf.jsDALServerUrl).then(r => {
                    // TODO: update config from here
                    console.info("RESP!!!", r.data);
                });

                //this.processConfig(conf);
                setInterval(() => {
                    // TODO: setInterval is a bad idea
                    this.processConfig(conf);

                }, 2000);


            });
        }
        catch (e) {
            console.error(e);
        }
        //console.info(`${configs.length} config(s) parsed in total`);
    }


    private processConfig(conf: JsDALConfig) {

        ConsoleLog.output();

        async.forEach(conf.ProjectList, async (project: JsDALProject) => {
            // TODO: only do EACH section only every (x) seconds

            ///////////////////////////////////////
            // Check for new or deleted DB sources
            {
                await jsDALServerApi.GetDbSourcesOnly(conf.jsDALServerUrl, project.Guid).then(r => {

                    if (r.statusCode == 404/*NOT FOUND*/) {
                        // TODO: Project not found, remove?
                        return;
                    }

                    let dbSourceObjects = JsDALDbSource.deserialize(<any>r.data);

                    project.updateFrom(dbSourceObjects);

                }).catch(e => {
                    if (e.code == 'ECONNREFUSED') {
                        console.info("Failed to connect!", conf.jsDALServerUrl);
                    }
                    else {
                        console.dir(e);
                        console.log("***" + e.toString());
                    }

                });
            }

            /////////////////////////////////////////////
            // Check DB sources for output file changes
            {
                /*
                var sourceToCheck = this.configs.map(c=>c.ProjectList) // project each config's Project list
                            .reduce((p1,p2)=>p1.concat(p2)) // combine all the different Project lists (across all configs) into a *single* array
                            .map(p=>p.Sources) // project only the sources property
                            .reduce((p1,p2)=>p1.concat(p2)); // combine all sources to check into one flat array
    
                //console.log("sourceToCheck:", sourceToCheck.length, sourceToCheck)
                */

                conf.ProjectList.forEach(async (proj) => {
                    await this.processDbSources(conf, proj);
                });
            }

            //////////////////////////////////////////
            // Check output files for version changes
            {
                if (conf.OutputPath) {
                    conf.ProjectList.forEach(p => {
                        p.Sources.forEach(dbSource => {
                            this.processJsFiles(conf, p, dbSource);
                        })
                    });
                }
            }

            /*
    
                         if (!string.IsNullOrEmpty(this.Config.OutputPath)) // make sure an output path is configured
                         {
                             foreach (var project in this.Config.ProjectList.Where(p => p.Included))
                             {
                                 foreach (var dbSource in project.Sources)
                                 {
                                     ProcessJsFiles(project, dbSource, dbSource.Files);
                                 }
                             }
                        }
             */


        });

    }

    // look for new or deleted JsFile children
    private async processDbSources(config: JsDALConfig, project: JsDALProject) {

        return async.forEach(project.Sources, async (source) => {
            //! RoutineCacheStore.Instance.UpdateDbSource(this.Config.jsDALServerUrl, source.Guid);

            // fetch list of output files from jsDAL Server
            await jsDALServerApi.GetOutputFiles(config.jsDALServerUrl, source.Guid).then((r: IApiResponse<any>) => {

                if (r.statusCode == 404/*NOT FOUND*/) {
                    // DB Source not found and is no longer valid
                    // TODO: REMOVE REMOVE REMOVE
                    //!sourcesToRemove.Add(source);
                    console.log("TODO: DB Source not found, remove....", source);
                    return;
                }

                source.updateFilesFrom(source, <any>r.data);

            }).catch(e => console.log(e.toString()));

        });
    }

    private processJsFiles(config: JsDALConfig, project: JsDALProject, dbSource: JsDALDbSource) {
        dbSource.JsFiles.forEach(jsFile => {
            try {
                let version = jsFile.Version;
                let projectPath = path.dirname(config.ConfigFilePath);
                let targetDir = path.join(projectPath, config.OutputPath, project.Name, dbSource.Name);
                let targetFilePath = path.join(targetDir, jsFile.Filename);

                let etag: string = null;

                if (fs.existsSync(targetFilePath)) {
                    //console.log("already exists, do md5 checking!!!");
                    let md5 = crypto.createHash('md5');
                    let fileData = fs.readFileSync(targetFilePath);

                    md5.update(fileData);

                    etag = '"' + md5.digest('hex') + '"';
                }

                // attempt to download a new version of the file
                jsDALServerApi.DownloadJsFile(config.jsDALServerUrl, jsFile.Guid, version, false/*minified*/, etag).then(r => {
                    try {
                        jsFile.Version = r.version;

                        if (!fs.existsSync(targetDir)) {

                            try {
                                shelljs.mkdir('-p', targetDir);
                            }
                            catch (e) {
                                console.log(chalk.red(e.toString()));
                            }
                        }

                        fs.writeFileSync(targetFilePath, r.data, { encoding: 'utf8' });

                        let prefix: string = `${chalk.bgCyan.black(Util.padRight(dbSource.Name, 20))}`;
                        ConsoleLog.log(prefix + chalk.green(`File written ${path.relative('./', targetFilePath)} (${r.data.length} bytes) and version ${r.version}`));

                        // TODO: move into separate function?
                        jsDALServerApi.DownloadTypeScriptDefinition(config.jsDALServerUrl, jsFile.Guid).then(r => {
                            if (r.data) {
                                let tsdFilePath = path.join(targetDir, jsFile.Filename.substr(0, jsFile.Filename.lastIndexOf('.')) + '.d.ts');
                                fs.writeFileSync(tsdFilePath, r.data, { encoding: 'utf8' });
                                ConsoleLog.log(prefix + chalk.green(`File written ${path.relative('./', tsdFilePath)} (${r.data.length} bytes)`));
                            }

                        });

                        let tsdCommonFilePath = path.join(targetDir, "jsDAL.common.d.ts");

                        if (dbSource.Options.IncludeCommonTsd) {
                            if (!fs.existsSync(tsdCommonFilePath) || fs.statSync(tsdCommonFilePath).size == 0) {
                                jsDALServerApi.DownloadCommonTypeScriptDefinitions(config.jsDALServerUrl).then((tsdCommon: string) => {

                                    fs.writeFileSync(tsdCommonFilePath, tsdCommon, { encoding: 'utf8' });

                                    ConsoleLog.log(prefix + `Output file written: \"${path.parse(tsdCommonFilePath).name}${path.parse(tsdCommonFilePath).ext}\" (${tsdCommon.length} bytes)`);
                                });
                            }
                        }
                        else {
                            // the main script's d.ts will still have a reference to the common TSD so let's give it a file, just an empty one
                            fs.writeFileSync(tsdCommonFilePath, `// TSD excluded on DataSource options`, { encoding: 'utf8' });
                        }
                    }
                    catch (e) {
                        console.log("\twrite failed!", e.toString());
                        ConsoleLog.log(e.toString());
                    }
                }).catch(err => {
                    if (err.statusCode == 304/*notModified*/) {
                        // file has not been modified, nothing to do here...
                        return;
                    }
                    else if (err.statusCode == 404/*NotFound*/) {
                        console.log("TODO: jsFile not found..clean up local stores!..delete file etc", err);

                        return;
                    }
                    else if (err.statusCode == 412/*PreconditionFailed*/) {
                        console.log(err);
                        return;
                    }
                    else {
                        console.log("!!!error!, statusCode: ", err);
                        ConsoleLog.log(err.toString());
                    }

                });

            }
            catch (e) {
                console.log(chalk.red(e.toString()));
                ConsoleLog.log(e.toString());
            }



        });


        /*
            Parallel.ForEach(jsFiles, new ParallelOptions() { MaxDegreeOfParallelism = 4, CancellationToken = this.CancellationTokenSource.Token }, (jsFile) =>
            {
                try
                {
    
                    *var data = jsDALServerApi.DownloadJsFile(this.Config.jsDALServerUrl, jsFile.Guid, version, false, etag, out notModified, out notFound, out newVersion);
    
                    *if (notModified) return;
    
                    if (notFound)
                    {
                        // jsFile no longer exists on the DAL Server, remove local file if it exists
                        if (File.Exists(targetFilePath))
                        {
                            try
                            {
                                File.Delete(targetFilePath);
                            }
                            catch (Exception ex)
                            {
                                SessionLog.Exception(ex);
                            }
                        }
    
                        var tsdFilePath = Path.Combine(targetDir, jsFile.Filename.Substring(0, jsFile.Filename.LastIndexOf('.')) + ".d.ts");
    
                        if (File.Exists(tsdFilePath))
                        {
                            try
                            {
                                File.Delete(tsdFilePath);
                            }
                            catch (Exception ex)
                            {
                                SessionLog.Exception(ex);
                            }
    
                        }
    
                        SessionLog.Info("r02: jsFile {0} ({1}) not found in DB Source {2} ({3}). Removing from project and deleting local file.", jsFile.Filename, jsFile.Guid, dbSource.Name, dbSource.Guid);
    
    
                        var b = dbSource.Files.Remove(jsFile);
    
                        return;
                    }
     
            });
        */

    }

}
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto'
import * as async from 'async';
import * as chalk from 'chalk';
import * as shelljs from 'shelljs';

import { jsDALServerApi, IApiResponse } from './jsDALServerApi';

import { JsDALConfig, JsDALProject, JsDALDbSource, JsDALFile } from './jsdal-config';
 // git test

const log = console.log;

if (typeof (<any>String).prototype.padLeft !== 'function') {
    (function (String, Array, ceil) {
        function padLeft(maxLength /*, fillString*/) {
            var string = String(this),
                fillString = arguments.length < 2 ? ' ' : String(arguments[1]),
                stringLength = string.length,
                diffLength = maxLength - stringLength;

            return diffLength < 1 ? string : Array(ceil(diffLength / fillString.length) + 1).join(fillString).slice(0, diffLength) + string;
        }

        if (typeof Object.defineProperty === 'function') {
            Object.defineProperty(this, 'padLeft', { writable: true, enumerable: false, configurable: true, value: padLeft });
        } else {
            this.padLeft = padLeft;
        }
    }.call(String.prototype, String, Array, Math.ceil));
}

if (typeof (<any>String).prototype.padRight !== 'function') {
    (function (String, Array, ceil) {
        function padRight(maxLength /*, fillString*/) {
            var string = String(this),
                fillString = arguments.length < 2 ? ' ' : String(arguments[1]),
                stringLength = string.length,
                diffLength = maxLength - stringLength;

            return diffLength < 1 ? string : string + Array(ceil(diffLength / fillString.length) + 1).join(fillString).slice(0, diffLength);
        }

        if (typeof Object.defineProperty === 'function') {
            Object.defineProperty(this, 'padRight', { writable: true, enumerable: false, configurable: true, value: padRight });
        } else {
            this.padRight = padRight;
        }
    }.call(String.prototype, String, Array, Math.ceil));
}

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


async function enumerateJsDalFiles(): Promise<JsDALConfig[]> {
    return new Promise<any>(async (resolve, reject) => {

        let folder = './';

        let configs: JsDALConfig[] = [];

        fs.readdir(folder, (err, files) => {
            var jsDALFiles = files.filter(f => f.endsWith(".jsDAL"));

            console.log(chalk.grey(`Found (${jsDALFiles.length}) .jsDAL file(s) in the current directory.`));

            jsDALFiles.forEach(filePath => {

                try {
                    let data: string = fs.readFileSync(filePath, "utf8");

                    let config: JsDALConfig = new JsDALConfig().deserialize(JSON.parse(data));


                    config.ConfigFilePath = path.resolve(filePath);

                    console.log(`\t${chalk.green(filePath)} (${chalk.bgWhite.blue(config.jsDALServerUrl)})`);

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


class Main {

    configs: JsDALConfig[];

    public static async init() {
        let main = new Main();

        main.main();
    }

    private async main() {
        try {


            this.configs = await enumerateJsDalFiles();

            async.forEach(this.configs, (conf: JsDALConfig) => {
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
        //    console.log("\t\t!!!\t",conf.ProjectList,"\r\n\r\n");

        async.forEach(conf.ProjectList, async (project: JsDALProject) => {
            //console.log(chalk.bold.italic.underline.white(`${project.Name} (${project.Guid})`));
            //console.log("¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯");

            // TODO: only do EACH section only every (x) seconds

            ///////////////////////////////////////
            // Check for new or deleted DB sources
            {
                await jsDALServerApi.GetDbSourcesOnly(conf.jsDALServerUrl, project.Guid).then((r: IApiResponse) => {

                    if (r.statusCode == 404/*NOT FOUND*/) {
                        // TODO: Project not found, remove?
                        return;
                    }

                    let dbSourceObjects = JsDALDbSource.deserialize(<any>r.data);

                    project.updateFrom(dbSourceObjects);

                }).catch(e => console.log(e.toString()));
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
                    conf.ProjectList.forEach(p => { p.Sources.forEach(dbSource => { this.processJsFiles(conf, p, dbSource); }) });
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
            await jsDALServerApi.GetOutputFiles(config.jsDALServerUrl, source.Guid).then((r: IApiResponse) => {

                if (r.statusCode == 404/*NOT FOUND*/) {
                    // DB Source not found and is no longer valid
                    // TODO: REMOVE REMOVE REMOVE
                    //!sourcesToRemove.Add(source);
                    console.log("TODO: DB Source not found, remove....", source);
                    return;
                }

                source.updateFilesFrom(source, <any>r.data);

            }).catch(e => console.log(e.toString()));


            /*

   try
                {
                

                     // remove deleted files
                    var toRemove = new List<JsFile>();

                    source.Files.ForEach(curFile =>
                    {
                        var match = outputFiles.FirstOrDefault(f => f.Guid.Equals(curFile.Guid));

                        if (match == null) // no match so file must have been removed
                        {
                            toRemove.Add(curFile);

                            var project = config.ProjectList.FirstOrDefault(p => p.Sources.Contains(source));
                            var projectPath = new FileInfo(ConfigFilePath).Directory.FullName;
                            var targetDir = Path.Combine(projectPath, this.Config.OutputPath, project.Name, source.Name);
                            var targetFilePath = Path.Combine(targetDir, curFile.Filename);

                            // attempt to delete local files
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

                            var tsdFilePath = Path.Combine(targetDir, curFile.Filename.Substring(0, curFile.Filename.LastIndexOf('.')) + ".d.ts");

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

                            SessionLog.Info("r01: jsFile {0} ({1}) not found in DB Source {2} ({3}). Removing from project and deleting local file.", curFile.Filename, curFile.Guid, source.Name, source.Guid);
                        }
                    });

                    source.Files.RemoveAll(f=>toRemove.Contains(f));

                    var newFiles = new List<JsFile>();

                    outputFiles.ForEach(file =>
                    {
                        var match = source.Files.FirstOrDefault(f => f.Guid.Equals(file.Guid));

                        if (match == null) // no match so must be a new file
                        {
                            newFiles.Add(file);
                        }
                    });

                    source.Files.AddRange(newFiles);

                }
                catch (Exception ee)
                {
                    if (ee.InnerException is WebException)
                    {
                        WebException we = (WebException)ee.InnerException;
                        
                        var buffer = new byte[we.Response.ContentLength];
                        using (var s = we.Response.GetResponseStream())
                        {
                            s.Read(buffer, 0, buffer.Length);

                            var content = System.Text.Encoding.UTF8.GetString(buffer);

                            SessionLog.Error(content);
                        }
                    }
                    else
                    {
                        SessionLog.Exception(ee, this.Config?.jsDALServerUrl, source.Guid);
                    }
                }

            */

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
                jsDALServerApi.DownloadJsFile(config.jsDALServerUrl, jsFile.Guid, version, false, etag).then(r => {
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

                        fs.writeFileSync(targetFilePath, r.data, 'utf8');
                        console.log(chalk.green("\tOutput file written %s (%s bytes) and version %s"), path.relative('./', targetFilePath), r.data.length, r.version);

                        // TODO: move into separate function?
                        jsDALServerApi.DownloadTypeScriptDefinition(config.jsDALServerUrl, jsFile.Guid).then(r => {
                            if (r.data) {
                                let tsdFilePath = path.join(targetDir, jsFile.Filename.substr(0, jsFile.Filename.lastIndexOf('.')) + '.d.ts');
                                fs.writeFileSync(tsdFilePath, r.data, 'utf8');
                                console.log(chalk.green("\tOutput file written %s (%s bytes)"), path.relative('./', tsdFilePath), r.data.length);
                                // File.WriteAllBytes(tsdFilePath, tsd);
                                // SessionLog.Info("Output file written: \"{0}\" ({1} bytes)", new FileInfo(tsdFilePath).Name, tsd.Length);
                            }

                        });

/* TODO: Consider whether or not we actually need tsdCommon if the intent is to serve it with l2-lib!
                        var tsdCommonFilePath = Path.Combine(targetDir, "jsDAL.common.d.ts");

                        if (!File.Exists(tsdCommonFilePath) || new FileInfo(tsdCommonFilePath).Length == 0) {
                            var tsdCommon = jsDALServerApi.DownloadCommonTypeScriptDefinitions(this.Config.jsDALServerUrl);
                            File.WriteAllBytes(tsdCommonFilePath, tsdCommon);
                            SessionLog.Info("Output file written: \"{0}\" ({1} bytes)", new FileInfo(tsdCommonFilePath).Name, tsdCommon.Length);
                        }*/



                    }
                    catch (e) {
                        console.log("\twrite failed!", e.toString());
                    }
                }).catch(err => {
                    if (err.statusCode == 304/*notModified*/) {
                        // file has not been modified, nothing to do here...
                        return;
                    }
                    else if (err.statusCode == 404/*NotFound*/) {
                        console.log("TODO: jsFile not found..clean up local stores!..delete file etc");

                        return;
                    }
                    else if (err.statusCode == 412/*PreconditionFailed*/) {
                        console.log(err);
                        return;
                    }
                    else {
                        console.log("!!!error!, statusCode: ", err.statusCode);
                    }

                });

            }
            catch (e) {
                console.log(chalk.red(e.toString()));
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


try {
    Main.init();
}
catch (e) {
    console.error(e);
}

// for each .jsDAL file     
// parse
// start Monitoring


// on Monitor
//      -> check for DB source changes
//      -> check for jsFile changes

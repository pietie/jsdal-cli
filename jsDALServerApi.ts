import http = require("http");
import URL = require("url");

export interface IApiResponse {
    data: any;
    statusCode: number;
    headers: any;
}

export class jsDALServerApi {
    private static fetchFromApi(serverUrl: string, apiPath: string, method: string = "GET", autoParseJson: boolean = true, headers?: { [key: string]: any }): Promise<IApiResponse> {

        return new Promise<any>((resolve, reject) => {
            let url = URL.parse(serverUrl);

            let options: http.RequestOptions = {
                host: url.hostname,
                port: parseInt(url.port),
                path: apiPath,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            //var prot = options.port == 443 ? https : http;
            let prot = http;

            let req = prot.request(options, (res) => {
                let output = '';
                let sc = res.statusCode;

                res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    output += chunk;
                });

                res.on('end', () => {
                    try {
                        let obj = output;

                        if (autoParseJson) obj = JSON.parse(output);

                        resolve({ data: obj, statusCode: sc, headers: res.headers });

                    }
                    catch (ex) {
                        console.log("Failed to parse as JSON...");
                        console.log(output);
                    }
                });
            });

            req.on('error', function (err) {
                reject(err);
            });

            req.end();
        });
    }

    public static GetDbSourcesOnly(serverUrl: string, projectGuid: string): Promise<any> {
        return jsDALServerApi.fetchFromApi(serverUrl, `/api/jsdal/dbsources?projectGuid=${projectGuid}`);
    }

    public static GetOutputFiles(serverUrl: string, dbSourceGuid: string): Promise<any> {
        return jsDALServerApi.fetchFromApi(serverUrl, `/api/jsdal/files?dbSourceGuid=${dbSourceGuid}`);

        //         try {
        //             var wc = CreateWebClient();

        //             var t = wc.DownloadStringTaskAsync(string.Format("{0}/api/jsdal/files?dbSourceGuid={1}", jsDALServerUrl, dbSourceGuid));

        //             if (t.Wait(1000 * 60, cancellationToken)) {
        //                 return JsonConvert.DeserializeObject<List<JsFile>>(t.Result);
        //             }
        //             else return null;
        //         }
        //         catch (Exception ee) {
        //             if (ee.InnerException is WebException)
        //             {
        //                 WebException we = (WebException)ee.InnerException;

        //                 var resp = (System.Net.HttpWebResponse)we.Response;

        //                 if (resp ?.StatusCode == HttpStatusCode.NotFound)
        //                 {
        //                     dbSourceNotFound = true;
        //                     return null;
        //                 }

        //                 throw;
        //             }
        //                 else
        //                 {
        //     throw;
        // }
        //             }

        //         }
    }

    public static DownloadJsFile(serverUrl: string, jsFileGuid: string, version: number, minified: boolean, etag: string): Promise<any> {/*,  out bool notModified, out bool notFound,  out long? newVersion*/

        let headers = {};

        if (etag) {
            headers["If-None-Match"] = etag;
        }

        return new Promise<any>((resolve, reject) => {
            jsDALServerApi.fetchFromApi(serverUrl, `/api/js/${jsFileGuid}?v=${version}&min=${minified}`, "GET", false, headers).then(r => {

                if (r.statusCode == 200) {

                    let newVersion: number = version;

                    if (r.headers && r.headers['jsfver']) {
                        newVersion = parseInt(r.headers['jsfver']);
                    }

                    resolve({ data: r.data, version: newVersion });
                }
                else {
                    reject(r);
                }

                return r;
            }).catch(e => {
                reject(e);
            });

        });
    }

    public static DownloadTypeScriptDefinition(serverUrl: string, jsFileGuid: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            jsDALServerApi.fetchFromApi(serverUrl, `/api/js/${jsFileGuid}?&min=false&tsd=true&v=0`, "GET", false).then(r => {

                if (r.statusCode == 200) {

                    resolve({ data: r.data });
                }
                else {
                    reject(r);
                }

                return r;
            }).catch(e => {
                reject(e);
            });

        });


    }

}

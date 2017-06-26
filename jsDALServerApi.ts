import http = require("http");
import URL = require("url");
import { JsDALProject, JsDALDbSource } from "jsdal-config";

export interface IApiResponse<T> {
    data: T;
    statusCode: number;
    headers: any;
}

export class jsDALServerApi {
    private static fetchFromApi<T>(serverUrl: string, apiPath: string, method: string = "GET", autoParseJson: boolean = true, headers?: { [key: string]: any }): Promise<IApiResponse<T>> {
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

    public static getProjects(serverUrl: string): Promise<IApiResponse<JsDALProject[]>> {
        return jsDALServerApi.fetchFromApi(serverUrl, `/api/jsdal/projects`);
    }


    public static GetDbSourcesOnly(serverUrl: string, projectGuid: string): Promise<IApiResponse<JsDALDbSource[]>> {
        return jsDALServerApi.fetchFromApi(serverUrl, `/api/jsdal/dbsources?projectGuid=${projectGuid}`);
    }

    public static GetOutputFiles(serverUrl: string, dbSourceGuid: string): Promise<any> {
        return jsDALServerApi.fetchFromApi(serverUrl, `/api/jsdal/files?dbSourceGuid=${dbSourceGuid}`);
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

    public static DownloadCommonTypeScriptDefinitions(serverUrl: string) {
        return jsDALServerApi.fetchFromApi(serverUrl, `/api/tsd/common`, 'GET', false).then(r=>r.data);
    }

    /**


        public static bool IsServerAccessible(string jsDALServerUrl)
        {
            try
            {
                var wc = CreateWebClient();

                var t = wc.DownloadStringTaskAsync(string.Format("{0}/api/jsdal/ping", jsDALServerUrl));

                if (t.Wait(1000 * 20, CancellationToken.None))
                {
                    //return JsonConvert.DeserializeObject<List<Project>>(t.Result);
                    return true;
                }
                else return false;
            }
            catch(Exception)
            {
                return false;
            }
        }

       

        public static List<DBSource> GetDBSourcesAndOutputs(string jsDALServerUrl, Guid projectGuid, CancellationToken cancellationToken)
        {
            var wc = CreateWebClient();

            var t = wc.DownloadStringTaskAsync(string.Format("{0}/api/jsdal/outputs?projectGuid={1}", jsDALServerUrl,projectGuid));

            if (t.Wait(1000 * 60, cancellationToken))
            {
                return JsonConvert.DeserializeObject<List<DBSource>>(t.Result);
            }
            else return null;
        }

        public static List<DBSource> GetDbSourcesOnly(string jsDALServerUrl, Guid projectGuid, CancellationToken cancellationToken, out bool projectNotFound)
        {
            projectNotFound = false;

            try
            {
                var wc = CreateWebClient();

                var t = wc.DownloadStringTaskAsync(string.Format("{0}/api/jsdal/dbsources?projectGuid={1}", jsDALServerUrl, projectGuid));

                if (t.Wait(1000 * 60, cancellationToken))
                {
                    return JsonConvert.DeserializeObject<List<DBSource>>(t.Result);
                }
                else return null;
            }
            catch (Exception ee)
            {
                if (ee.InnerException is WebException)
                {
                    WebException we = (WebException)ee.InnerException;

                    var resp = (System.Net.HttpWebResponse)we.Response;

                    if (resp?.StatusCode == HttpStatusCode.NotFound)
                    {
                        projectNotFound = true;
                        return null;
                    }

                    throw;
                }
                else
                {
                    throw;
                }
            }

        }

        public static List<JsFile> GetOutputFiles(string jsDALServerUrl, Guid dbSourceGuid, CancellationToken cancellationToken, out bool dbSourceNotFound)
        {
            dbSourceNotFound = false;
            try
            {
                var wc = CreateWebClient();

                var t = wc.DownloadStringTaskAsync(string.Format("{0}/api/jsdal/files?dbSourceGuid={1}", jsDALServerUrl, dbSourceGuid));

                if (t.Wait(1000 * 60, cancellationToken))
                {
                    return JsonConvert.DeserializeObject<List<JsFile>>(t.Result);
                }
                else return null;
            }
            catch (Exception ee)
            {
                if (ee.InnerException is WebException)
                {
                    WebException we = (WebException)ee.InnerException;

                    var resp = (System.Net.HttpWebResponse)we.Response;

                    if (resp?.StatusCode == HttpStatusCode.NotFound)
                    {
                        dbSourceNotFound = true;
                        return null;
                    }

                    throw;
                }
                else
                {
                    throw;
                }
            }
            
        }


        public static List<Routine> GetMetadataUpdates(string jsDALServerUrl, Guid dbSourceGuid, long maxRowVer)
        {
            var wc = CreateWebClient();

            var json = wc.DownloadString(string.Format("{0}/api/meta?dbSourceGuid={1}&maxRowver={2}", jsDALServerUrl, dbSourceGuid, maxRowVer));

            if (json == null) return new List<Routine>();

            return JsonConvert.DeserializeObject<List<Routine>>(json);
        }

        public static byte[] DownloadJsFile(string jsDALServerUrl, Guid jsFileGuid, long version, bool minified, string etag, out bool notModified, out bool notFound,  out long? newVersion)
        {
            notModified = false;
            notFound = false;
            newVersion = null;

            var wc = CreateWebClient();

            try
            {
                if (etag != null)
                {
                    wc.Headers.Add("If-None-Match", etag);
                }


                var data = wc.DownloadData(string.Format("{0}/api/js/{1}?v={2}&min={3}", jsDALServerUrl, jsFileGuid, version, minified));


                if (wc.ResponseHeaders != null)
                {
                    newVersion = long.Parse(wc.ResponseHeaders["jsfver"]);
                }
                
                return data;
            }
            catch(WebException we)
            {               
                var resp = (System.Net.HttpWebResponse)we.Response;

                if (resp?.StatusCode == HttpStatusCode.NotModified)
                {
                    notModified = true;
                    return null;
                }

                if (resp?.StatusCode == HttpStatusCode.NotFound)
                {
                    notFound = true;
                    return null;
                }

                if (resp?.StatusCode == HttpStatusCode.PreconditionFailed)
                {
                    var buffer = new byte[resp.ContentLength];
                    using (var s = we.Response.GetResponseStream())
                    {
                        s.Read(buffer, 0, buffer.Length);

                        var content = System.Text.Encoding.UTF8.GetString(buffer);

                    }
                        return null;
                }

                throw;
            }

        }

        public static byte[] DownloadTypeScriptDefinition(string jsDALServerUrl, Guid jsFileGuid)
        {
            var wc = CreateWebClient();

            try
            {
                var data = wc.DownloadData(string.Format("{0}/api/js/{1}?&min=false&tsd=true&v=0", jsDALServerUrl, jsFileGuid));
                return data;
            }
            catch (WebException we)
            {
                var resp = (System.Net.HttpWebResponse)we.Response;

                if (resp?.StatusCode == HttpStatusCode.NotFound)
                {
                    return null;
                }

                throw;
            }

        }

        

     * 
     */

}

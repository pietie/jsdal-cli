import { JsDALProject } from './JsDALProject'
import { ISerializable } from '~/ISerializable'
import * as moment from 'moment';

export class JsDALConfig implements ISerializable<JsDALConfig> {
    ConfigFilePath: string;

    jsDALServerUrl?: string;
    OutputPath: string;
    ProjectList: JsDALProject[];

    lastStatus: jsDALServerStatus;


    deserialize(src: JsDALConfig) {
        this.jsDALServerUrl = src.jsDALServerUrl;
        this.OutputPath = src.OutputPath;
        this.ProjectList = [];

        if (src.ProjectList) {
            this.ProjectList = src.ProjectList.map(p => {
                let project = new JsDALProject();

                return project.deserialize(p);
            });
        }

        return this;
    }
}

export class jsDALServerStatus
{
    lastChecked: moment.Moment;
    status:string;
}
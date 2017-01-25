import { JsDALProject } from './JsDALProject'
import { ISerializable } from '~/ISerializable'

export class JsDALConfig implements ISerializable<JsDALConfig> {
    ConfigFilePath: string;

    jsDALServerUrl?: string;
    OutputPath: string;
    ProjectList: JsDALProject[]

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
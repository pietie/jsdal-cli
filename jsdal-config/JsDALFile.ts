import { ISerializable } from '~/ISerializable'

export class JsDALFile implements ISerializable<JsDALFile> {
    public Filename: string;
    public Guid: string;

    public Version: number;

    deserialize(src: JsDALFile) {
        this.Filename = src.Filename;
        this.Guid = src.Guid;
        this.Version = src.Version;

        return this;
    }

    updateFrom(existing: JsDALFile) {
        this.Filename = existing.Filename;
        this.Version = existing.Version;
    }
}
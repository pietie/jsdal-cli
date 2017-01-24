export interface ISerializable<T> {
    deserialize(src: T): T;
}
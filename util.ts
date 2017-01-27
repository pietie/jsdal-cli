export class Util
{
    public static padRight(input: string, maxLength:number, padChar:string=' ') : string
    {
        if (input.length >= maxLength)
        {
            return input.substring(0, maxLength);
        }

        padChar = padChar.repeat(maxLength - input.length);

        return input + padChar;
    }

}
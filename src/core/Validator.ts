/*
 * ExceptionHandler Class 
 */

import * as log from 'N/log';
import * as email from 'N/email';
import * as runtime from 'N/runtime';
import { validate, Contains, IsInt, Length, IsEmail, IsFQDN, IsDate, Min, Max } from "class-validator";


export interface ValidatorOptions {
    isEmpty?: boolean;

}


interface ValidatorInterface {
    fieldId: string;

    validate(): this;
    clearField(): this;
}


class Validator implements ValidatorInterface {

    fieldId: string;


    constructor() {
        this.fieldId
    }

    validate() {

        return this;
    }

    clearField() {

        return this;
    }
}

export { Validator };



export class Post {

    @Length(10, 20)
    title: string;

    @Contains("hello")
    text: string;

    @IsInt()
    @Min(0)
    @Max(10)
    rating: number;

    @IsEmail()
    email: string;

    @IsFQDN()
    site: string;

    @IsDate()
    createDate: Date;
}
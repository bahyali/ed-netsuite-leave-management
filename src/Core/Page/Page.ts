import {BaseModel} from "../Model/BaseModel";
import {FieldGroup} from "N/ui/serverWidget";

interface PageInterface extends BaseModel {
    getField(field)

    getFields(fields?): FieldGroup
}

class Page extends BaseModel implements PageInterface {

    getField(field) {

    }

    getFields(fields?): FieldGroup {
        return undefined;
    }

}

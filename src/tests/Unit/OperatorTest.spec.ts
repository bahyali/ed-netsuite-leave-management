import {Operator} from "../../Core/Model/Operator";
import {ColumnType} from "../../Core/Model/BaseModel";

describe('Operator ', () => {

    it('should return value', () => {
        const result = Operator.get('==', ColumnType.STRING);
        expect(result).toBeTruthy()
    });

    it('should return value of nsOperator', () => {
        const result = Operator.get('is');
        expect(result).toBeTruthy()
    });

    it('should break on wrong operator', () => {
        const result = () => Operator.get('wrongOperator', ColumnType.BOOLEAN);
        expect(result).toThrowError();
    });

    it('should not break on wrong columnType', () => {
        const result = () => Operator.get('==', 'wrongDataType');
        expect(result).toThrowError();
    });

});
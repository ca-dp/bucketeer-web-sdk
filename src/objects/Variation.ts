import { isNotNullAndUndefined } from 'option-t/lib/Maybe/Maybe';

const requiredProps: Array<keyof VariationAsPlainObject> = ['id', 'value'];

// tslint:disable-next-line no-any
export function existsRequiredVariationProps(obj: any): boolean {
  return requiredProps.every((prop) => isNotNullAndUndefined(obj[prop]));
}

export type VariationAsPlainObject = {
  id: string;
  value: string;
};

export class Variation {
  get id(): string {
    return this._plainObj.id;
  }

  get value(): string {
    return this._plainObj.value;
  }

  private _plainObj: VariationAsPlainObject;

  constructor(plainObj: VariationAsPlainObject) {
    this._plainObj = plainObj;
  }

  toPlainObject(): VariationAsPlainObject {
    return this._plainObj;
  }
}

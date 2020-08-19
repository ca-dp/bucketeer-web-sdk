import { isNotNullAndUndefined } from 'option-t/lib/Maybe/Maybe';
import { createOk, createErr, Result } from 'option-t/lib/PlainResult/Result';
import { existsRequiredVariationProps, Variation, VariationAsPlainObject } from './Variation';
import { Reason, ReasonAsPlainObject } from './Reason';
import { User, UserAsPlainObject } from './User';

const requiredProps: Array<keyof EvaluationAsPlainObject> = [
  'id',
  'featureId',
  'featureVersion',
  'userId',
  'user',
  'variationId',
  'variation',
];

// tslint:disable-next-line no-any
export function existsRequiredEvaluationProps(obj: any): boolean {
  return requiredProps.every((prop) => isNotNullAndUndefined(obj[prop]));
}

// tslint:disable-next-line no-any
export function convertRawToEvaluation(obj: any): Result<Evaluation, Error> {
  const ok = existsRequiredEvaluationProps(obj) && existsRequiredVariationProps(obj.variation);
  return ok ? createOk(new Evaluation(obj)) : createErr(new Error('requiredProps not exist'));
}

export type EvaluationAsPlainObject = {
  id: string;
  featureId: string;
  featureVersion: number;
  userId: string;
  user: UserAsPlainObject;
  variationId: string;
  variation: VariationAsPlainObject;
  reason: ReasonAsPlainObject;
};

export class Evaluation {
  get id(): string {
    return this._plainObj.id;
  }

  get featureId(): string {
    return this._plainObj.featureId;
  }

  get featureVersion(): number {
    return this._plainObj.featureVersion;
  }

  get userId(): string {
    return this._plainObj.userId;
  }

  get user(): User {
    return new User(this._plainObj.user);
  }

  get variationId(): string {
    return this._plainObj.variationId;
  }

  get variation(): Variation {
    return new Variation(this._plainObj.variation);
  }

  get reason(): Reason {
    return new Reason(this._plainObj.reason);
  }

  private _plainObj: EvaluationAsPlainObject;

  constructor(plainObj: EvaluationAsPlainObject) {
    this._plainObj = plainObj;
  }

  toPlainObject(): EvaluationAsPlainObject {
    return this._plainObj;
  }
}

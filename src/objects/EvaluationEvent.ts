import { Reason, ReasonAsPlainObject } from './Reason';

export type EvaluationEventAsPlainObject = {
  featureId: string;
  featureVersion: number;
  userId: string;
  variationId: string;
  reason: ReasonAsPlainObject;
  timestamp: number;
  '@type'?: string;
};

export class EvaluationEvent {
  get featureId(): string {
    return this._plainObj.featureId;
  }

  get featureVersion(): number {
    return this._plainObj.featureVersion;
  }

  get userId(): string {
    return this._plainObj.userId;
  }

  get variationId(): string {
    return this._plainObj.variationId;
  }

  get timestamp(): number {
    return this._plainObj.timestamp;
  }

  private _plainObj: EvaluationEventAsPlainObject;

  constructor(plainObj: EvaluationEventAsPlainObject) {
    plainObj['@type'] = 'type.googleapis.com/bucketeer.event.client.EvaluationEvent';
    this._plainObj = plainObj;
  }

  toPlainObject(): EvaluationEventAsPlainObject {
    return this._plainObj;
  }
}

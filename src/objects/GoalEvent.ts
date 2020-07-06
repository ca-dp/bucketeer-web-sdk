import { Evaluation, EvaluationAsPlainObject } from './Evaluation';

export type GoalEventAsPlainObject = {
  goalId: string;
  userId: string;
  value: number;
  evaluations: Array<EvaluationAsPlainObject>;
  timestamp: number;
  '@type'?: string;
};

export class GoalEvent {
  get goalId(): string {
    return this._plainObj.goalId;
  }

  get userId(): string {
    return this._plainObj.userId;
  }

  get value(): number {
    return this._plainObj.value;
  }

  get evaluations(): Array<Evaluation> {
    return this._plainObj.evaluations.map((obj) => new Evaluation(obj));
  }

  get timestamp(): number {
    return this._plainObj.timestamp;
  }

  private _plainObj: GoalEventAsPlainObject;

  constructor(plainObj: GoalEventAsPlainObject) {
    plainObj['@type'] = 'type.googleapis.com/bucketeer.event.client.GoalEvent';
    this._plainObj = plainObj;
  }

  toPlainObject(): GoalEventAsPlainObject {
    return this._plainObj;
  }
}

import {
  GetEvaluationLatencyMetricsEvent,
  GetEvaluationLatencyMetricsEventAsPlainObject,
} from './GetEvaluationLatencyMetricsEvent';
import {
  GetEvaluationSizeMetricsEvent,
  GetEvaluationSizeMetricsEventAsPlainObject,
} from './GetEvaluationSizeMetricsEvent';

export type MetricsEventAsPlainObject = {
  timestamp: number;
  event: GetEvaluationLatencyMetricsEventAsPlainObject | GetEvaluationSizeMetricsEventAsPlainObject;
  '@type'?: string;
};

export class MetricsEvent {
  get timestamp(): number {
    return this._plainObj.timestamp;
  }

  get event():
    | GetEvaluationLatencyMetricsEventAsPlainObject
    | GetEvaluationSizeMetricsEventAsPlainObject {
    return this._plainObj.event;
  }

  private _plainObj: MetricsEventAsPlainObject;

  constructor(plainObj: MetricsEventAsPlainObject) {
    plainObj['@type'] = 'type.googleapis.com/bucketeer.event.client.MetricsEvent';
    this._plainObj = plainObj;
  }

  toPlainObject(): MetricsEventAsPlainObject {
    return this._plainObj;
  }
}

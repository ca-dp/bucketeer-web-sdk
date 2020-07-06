import { Nullable, isNull, isNotNull } from 'option-t/lib/Nullable/Nullable';
import { unwrapOrFromMaybe } from 'option-t/lib/Maybe/unwrapOr';
import { Result, createOk, createErr } from 'option-t/lib/PlainResult/Result';
import { User } from '../objects/User';
import { Evaluation } from '../objects/Evaluation';
import { EvaluationEvent, EvaluationEventAsPlainObject } from '../objects/EvaluationEvent';
import { GoalEvent, GoalEventAsPlainObject } from '../objects/GoalEvent';
import { MetricsEvent, MetricsEventAsPlainObject } from '../objects/MetricsEvent';
import { VERSION, Item, getDefaultItem } from '../storage/shared';

function isEvaluationEventAsObject(
  obj: EvaluationEventAsPlainObject | GoalEventAsPlainObject | MetricsEventAsPlainObject,
): obj is EvaluationEventAsPlainObject {
  return obj['@type'] === 'type.googleapis.com/bucketeer.event.client.EvaluationEvent';
}

function isGoalEventAsObject(
  obj: EvaluationEventAsPlainObject | GoalEventAsPlainObject | MetricsEventAsPlainObject,
): obj is GoalEventAsPlainObject {
  return obj['@type'] === 'type.googleapis.com/bucketeer.event.client.GoalEvent';
}

function isMetricsEventAsObject(
  obj: EvaluationEventAsPlainObject | GoalEventAsPlainObject | MetricsEventAsPlainObject,
): obj is MetricsEventAsPlainObject {
  return obj['@type'] === 'type.googleapis.com/bucketeer.event.client.MetricsEvent';
}

export class StorageWrapper {
  private _keyprefix: string;
  private _item: Item;

  constructor(keyprefix: string) {
    this._keyprefix = keyprefix;
    this._item = unwrapOrFromMaybe(getItem(keyprefix).val, getDefaultItem());
  }

  reset(): void {
    const item = getDefaultItem();
    this._item = item;
  }

  save(): void {
    setItem(this._keyprefix, this._item);
  }

  getUser(): Nullable<User> {
    const obj = this._item.user;
    return obj ? new User(obj) : null;
  }

  setUser(user: User): void {
    this._item.user = user.toPlainObject();
  }

  getUserEvaluationsId(): string {
    return this._item.userEvaluationsId;
  }

  setUserEvaluationsId(userEvaluationsId: string): void {
    this._item.userEvaluationsId = userEvaluationsId;
  }

  getLatestEvaluations(): Array<Evaluation> {
    const objs = this._item.latestEvaluations;
    return objs.map((obj) => new Evaluation(obj));
  }

  setLatestEvaluations(evaluations: Array<Evaluation>): void {
    this._item.latestEvaluations = evaluations.map((evaluation) => evaluation.toPlainObject());
  }

  getCurrentEvaluations(): Array<Evaluation> {
    const objs = this._item.currentEvaluations;
    return objs.map((obj) => new Evaluation(obj));
  }

  setCurrentEvaluations(evaluations: Array<Evaluation>): void {
    this._item.currentEvaluations = evaluations.map((evaluation) => evaluation.toPlainObject());
  }

  getEvents(): Array<EvaluationEvent | GoalEvent | MetricsEvent> {
    const objs = this._item.events;
    return objs.map((obj) => {
      if (isEvaluationEventAsObject(obj)) {
        return new EvaluationEvent(obj);
      }
      if (isGoalEventAsObject(obj)) {
        return new GoalEvent(obj);
      }
      return new MetricsEvent(obj);
    });
  }

  setEvents(events: Array<EvaluationEvent | GoalEvent | MetricsEvent>): void {
    this._item.events = events.map((event) => event.toPlainObject());
  }
}

const isAvailableLocalStorage = (function (): boolean {
  return 'localStorage' in window && !!window.localStorage;
})();

export function createStorage(keyprefix?: string): Nullable<StorageWrapper> {
  const k: string = unwrapOrFromMaybe<string>(keyprefix, '');
  return isAvailableLocalStorage ? new StorageWrapper(k) : null;
}

const KEY = 'bucketeer';

function getItem(prefix: string): Result<Nullable<Item>, Error> {
  const key = keyname(prefix, KEY);

  try {
    const item = parseJson<Item>(window.localStorage.getItem(key));
    if (isNull(item)) {
      return createErr(new Error('item is null'));
    } else if (isNotNull(item) && item.version !== VERSION) {
      return createErr(new Error('version is wrong'));
    }
    return createOk(item);
  } catch (_) {
    return createErr(new Error('localStorage.getItem is failed'));
  }
}

function setItem(prefix: string, item: Item): void {
  const key = keyname(prefix, KEY);

  try {
    window.localStorage.setItem(key, JSON.stringify(item));
    // eslint-disable-next-line no-empty
  } catch (_) {}
}

function keyname(prefix: string, name: string): string {
  return prefix + name;
}

function parseJson<T>(raw: Nullable<string>): Nullable<T> {
  if (isNull(raw)) {
    return null;
  }
  try {
    const o: T = JSON.parse(raw);
    return o;
  } catch (_) {
    return null;
  }
}

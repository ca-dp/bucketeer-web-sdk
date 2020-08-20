import { tapMaybe } from 'option-t/lib/Maybe/tap';
import { Nullable } from 'option-t/lib/Nullable/Nullable';
import { tapNullable } from 'option-t/lib/Nullable/tap';
import { mapOrForNullable } from 'option-t/lib/Nullable/mapOr';
import { unwrapOrElseFromNullable } from 'option-t/lib/Nullable/unwrapOrElse';
import { unwrapOrFromUndefinable } from 'option-t/lib/Undefinable/unwrapOr';
import { isErr } from 'option-t/lib/PlainResult/Result';
import { createGetEvaluationsAPI, GetEvaluationsState } from './api/getEvaluations';
import { createRegisterEventsAPI } from './api/registerEvents';
import { FetchLike, setFetch } from './api/fetch';
import { createStorage, StorageWrapper } from './storage/storage';
import { User, UserAsPlainObject } from './objects/User';
import { Evaluation } from './objects/Evaluation';
import { EvaluationEvent } from './objects/EvaluationEvent';
import { GoalEvent } from './objects/GoalEvent';
import { MetricsEvent } from './objects/MetricsEvent';
import { EvaluationAsPlainObject } from './objects/Evaluation';
import {
  GetEvaluationLatencyMetricsEvent,
  GetEvaluationLatencyMetricsEventAsPlainObject,
} from './objects/GetEvaluationLatencyMetricsEvent';
import {
  GetEvaluationSizeMetricsEvent,
  GetEvaluationSizeMetricsEventAsPlainObject,
} from './objects/GetEvaluationSizeMetricsEvent';
import { Reason, ReasonType } from './objects/Reason';
import { EvaluationStore } from './stores/EvaluationStore';
import { EventStore } from './stores/EventStore';
import { createSchedule, removeSchedule } from './schedule';
import { Host, Token, Tag, GIT_REVISION } from './shared';

export interface Config {
  host: Host;
  token: Token;
  tag: Tag;
  user: UserAsPlainObject;
  fetch: FetchLike;
  pollingIntervalForGetEvaluations: number;
  pollingIntervalForRegisterEvents: number;
  onInitialize?: (error?: Error) => void;

  // A user can override the storage key prefix by this property.
  storageKeyPrefix?: string;
}

export interface BuildInfo {
  readonly GIT_REVISION: string;
}

export interface EvaluationInfo {
  id: string;
  featureId: string;
  featureVersion: number;
  userId: string;
  variationId: string;
  variationValue: string;
  reason: number;
}

export { FetchLike, FetchRequestLike, FetchResponseLike } from './api/fetch';

export interface Bucketeer {
  getStringVariation(featureId: string, defaultValue: string): string;
  track(goalId: string, value?: number): void;
  destroy(): void;
  getBuildInfo(): BuildInfo;
  setUser(user: UserAsPlainObject, onGetEvaluations?: () => void): void;
  getUser(): Nullable<UserAsPlainObject>;
  getEvaluation(featureId: string): Nullable<EvaluationInfo>;
}

const COUNT_PER_REGISTER_EVENT = 5;

const SECOND_AS_MILLISEC = 1000;

function createTimestamp(): number {
  const millisec = Date.now();
  // It is necessary for validation at backend.
  const sec = Math.floor(millisec / SECOND_AS_MILLISEC);
  return sec;
}

function convertMS(ms: number): string {
  return (ms / 1000).toString() + 's';
}

function lengthInUtf8Bytes(str: string): number {
  return unescape(encodeURIComponent(str)).length;
}

export function initialize(config: Config): Bucketeer {
  const {
    host,
    token,
    tag,
    fetch,
    pollingIntervalForGetEvaluations,
    pollingIntervalForRegisterEvents,
    onInitialize = () => {},
    storageKeyPrefix,
  } = config;
  let user = new User(config.user);
  const storage = createStorage(storageKeyPrefix);
  tapNullable(storage, (storage) => {
    const currentUser = storage.getUser();
    if (currentUser) {
      if (currentUser.id === user.id) {
        user = new User({
          id: config.user.id,
          data: { ...currentUser.data, ...config.user.data },
        });
      } else {
        storage.reset();
      }
    }
  });
  tapNullable(storage, (storage) => storage.setUser(user));
  setFetch(fetch);

  const _getEvaluations = createGetEvaluationsAPI(host, token);
  const _registerEvents = createRegisterEventsAPI(host, token);

  let _userEvaluationsId = mapOrForNullable(storage, '', (storage) =>
    storage.getUserEvaluationsId(),
  );
  const latestEvaluations = mapOrForNullable(storage, [], (storage) =>
    storage.getLatestEvaluations(),
  );
  const currentEvaluations = mapOrForNullable(storage, [], (storage) =>
    storage.getCurrentEvaluations(),
  );
  const events = mapOrForNullable(storage, [], (storage) => storage.getEvents());

  const latestEvaluationStore = new EvaluationStore(latestEvaluations);
  const currentEvaluationStore = new EvaluationStore(currentEvaluations);
  const eventStore = new EventStore(events);

  function getEvaluations(): Promise<void> {
    const startTime: number = Date.now();
    return new Promise((resolve, reject) => {
      const evaluationsId = _userEvaluationsId;
      _getEvaluations(tag, user, evaluationsId).then((res) => {
        if (isErr(res)) {
          reject(res.err);
          return;
        }
        const durationMS: number = Date.now() - startTime;
        const labels: { [key: string]: string } = {};
        labels['tag'] = tag;
        if (res.val) {
          labels['state'] = res.val.state;
        }
        const getEvaluationLatencyMetricsEvent: MetricsEvent = new MetricsEvent({
          event: new GetEvaluationLatencyMetricsEvent({
            labels: labels,
            duration: convertMS(durationMS),
          }).toPlainObject(),
          timestamp: createTimestamp(),
        });
        eventStore.add(getEvaluationLatencyMetricsEvent);
        const getEvaluationSizeMetricsEvent: MetricsEvent = new MetricsEvent({
          event: new GetEvaluationSizeMetricsEvent({
            labels: labels,
            sizeByte: lengthInUtf8Bytes(JSON.stringify(res)),
          }).toPlainObject(),
          timestamp: createTimestamp(),
        });
        eventStore.add(getEvaluationSizeMetricsEvent);
        registerEvents();
        tapMaybe(res.val, ({ state, evaluations, userEvaluationsId }) => {
          if (state !== GetEvaluationsState.FULL || evaluationsId === userEvaluationsId) {
            resolve();
            return;
          }
          latestEvaluationStore.clear();
          latestEvaluationStore.setFromList(evaluations);
          currentEvaluationStore.sift(latestEvaluationStore.getAllKeys());
          _userEvaluationsId = userEvaluationsId;
          resolve();
        });
      });
    });
  }
  getEvaluations().then(
    () => onInitialize(),
    (e) => onInitialize(e),
  );
  const getEvaluationsScheduleID = createSchedule(getEvaluations, pollingIntervalForGetEvaluations);

  function registerEvents(): void {
    if (eventStore.size() >= COUNT_PER_REGISTER_EVENT) {
      _registerEvents(eventStore.takeout(COUNT_PER_REGISTER_EVENT));
    }
  }
  const registerEventsScheduleID = createSchedule(() => {
    if (eventStore.size() > 0) {
      _registerEvents(eventStore.takeout(eventStore.size()));
    }
  }, pollingIntervalForRegisterEvents);

  return {
    getStringVariation(featureId: string, defaultValue: string): string {
      const evaluation = unwrapOrElseFromNullable(
        latestEvaluationStore.get(featureId),
        () =>
          new Evaluation({
            id: '',
            featureId,
            featureVersion: 0,
            userId: user.id,
            variationId: '',
            variation: {
              id: '',
              value: defaultValue,
            },
            reason: {
              type: ReasonType.CLIENT,
            },
          }),
      );
      currentEvaluationStore.set(evaluation);
      const timestamp = createTimestamp();
      const evaluationEvent = new EvaluationEvent({
        featureId: evaluation.featureId,
        featureVersion: evaluation.featureVersion,
        userId: user.id,
        user,
        variationId: evaluation.variationId,
        reason: { type: ReasonType.CLIENT },
        timestamp,
      });
      eventStore.add(evaluationEvent);
      registerEvents();
      return evaluation.variation.value;
    },
    track(goalId: string, value?: number): void {
      const timestamp = createTimestamp();
      const goalEvent = new GoalEvent({
        goalId,
        userId: user.id,
        value: unwrapOrFromUndefinable(value, 0),
        evaluations: currentEvaluationStore
          .getAll()
          .map((evaluation) => evaluation.toPlainObject()),
        timestamp,
      });
      eventStore.add(goalEvent);
      registerEvents();
    },
    destroy(): void {
      tapNullable(storage, (storage) => {
        storage.setLatestEvaluations(latestEvaluationStore.getAll());
        storage.setCurrentEvaluations(currentEvaluationStore.getAll());
        storage.setEvents(eventStore.getAll());
        storage.setUserEvaluationsId(_userEvaluationsId);
        storage.save();
      });
      removeSchedule(getEvaluationsScheduleID);
      removeSchedule(registerEventsScheduleID);
    },
    getBuildInfo(): BuildInfo {
      return {
        GIT_REVISION,
      };
    },
    setUser(userAsPlainObject: UserAsPlainObject, onGetEvaluations?: () => void): void {
      user = new User(userAsPlainObject);
      tapNullable(storage, (storage) => {
        const currentUser = storage.getUser();
        if (currentUser && currentUser.id !== user.id) {
          storage.reset();
        }
      });
      tapNullable(storage, (storage) => storage.setUser(user));
      if (onGetEvaluations) {
        getEvaluations().then(onGetEvaluations);
      }
    },
    getUser(): Nullable<UserAsPlainObject> {
      let currentUser = null;
      if (storage) {
        currentUser = storage.getUser();
      }
      return currentUser ? currentUser.toPlainObject() : null;
    },
    getEvaluation(featureId: string): Nullable<EvaluationInfo> {
      const evaluation = latestEvaluationStore.get(featureId);
      return evaluation
        ? {
            id: evaluation.id,
            featureId: evaluation.featureId,
            featureVersion: evaluation.featureVersion,
            userId: evaluation.userId,
            variationId: evaluation.variationId,
            variationValue: evaluation.variation.value,
            reason: Reason.convTypeToNumber(evaluation.reason.type),
          }
        : null;
    },
  };
}

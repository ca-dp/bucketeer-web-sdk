import { Nullable } from 'option-t/lib/Nullable/Nullable';
import { UserAsPlainObject } from '../objects/User';
import { EvaluationAsPlainObject } from '../objects/Evaluation';
import { EvaluationEventAsPlainObject } from '../objects/EvaluationEvent';
import { GoalEventAsPlainObject } from '../objects/GoalEvent';
import { MetricsEventAsPlainObject } from '../objects/MetricsEvent';

export const VERSION = 1;

export interface VersioningItem {
  version: typeof VERSION;
}

export interface Item extends VersioningItem {
  user: Nullable<UserAsPlainObject>;
  userEvaluationsId: string;
  latestEvaluations: Array<EvaluationAsPlainObject>;
  currentEvaluations: Array<EvaluationAsPlainObject>;
  events: Array<EvaluationEventAsPlainObject | GoalEventAsPlainObject | MetricsEventAsPlainObject>;
}

export function getDefaultItem(): Item {
  return {
    version: VERSION,
    user: null,
    userEvaluationsId: '',
    latestEvaluations: [],
    currentEvaluations: [],
    events: [],
  };
}

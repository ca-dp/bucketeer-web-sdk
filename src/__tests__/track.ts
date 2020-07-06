import test from 'ava';
import { unwrapNullable } from 'option-t/lib/Nullable/unwrap';
import { createStorage } from '../storage/storage';
import { EvaluationEvent } from '../objects/EvaluationEvent';
import { GoalEvent } from '../objects/GoalEvent';
import { createBucketeer } from './_helper';

function isGoalEvent(event: EvaluationEvent | GoalEvent): event is GoalEvent {
  return event instanceof GoalEvent;
}

test('track', (t) => {
  const EXPECTED_GOAL_ID = 'goal-id-1';
  const EXPECTED_VALUE = 1;
  const bucketeer = createBucketeer();
  bucketeer.track(EXPECTED_GOAL_ID, EXPECTED_VALUE);
  bucketeer.destroy();
  const storage = unwrapNullable(createStorage());
  const events = storage.getEvents();
  t.is(events.length, 1);
  const event = events[0];
  t.is(unwrapNullable(isGoalEvent(event) ? event.goalId : null), EXPECTED_GOAL_ID);
  t.is(unwrapNullable(isGoalEvent(event) ? event.value : null), EXPECTED_VALUE);
});

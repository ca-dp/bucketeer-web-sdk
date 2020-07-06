import test from 'ava';
import { unwrapNullable } from 'option-t/lib/Nullable/unwrap';
import { createStorage } from '../storage/storage';
import { EvaluationEvent } from '../objects/EvaluationEvent';
import { GoalEvent } from '../objects/GoalEvent';
import { createBucketeer } from './_helper';

function isEvaluationEvent(event: EvaluationEvent | GoalEvent): event is EvaluationEvent {
  return event instanceof EvaluationEvent;
}

test('getStringVariation: event is set correctly', (t) => {
  const EXPECTED_FEATURE_ID = 'feature-id-1';
  const bucketeer = createBucketeer();
  bucketeer.getStringVariation(EXPECTED_FEATURE_ID, 'default-value-1');
  bucketeer.destroy();
  const storage = unwrapNullable(createStorage());
  const events = storage.getEvents();
  t.is(events.length, 1);
  const event = events[0];
  t.is(unwrapNullable(isEvaluationEvent(event) ? event.featureId : null), EXPECTED_FEATURE_ID);
});

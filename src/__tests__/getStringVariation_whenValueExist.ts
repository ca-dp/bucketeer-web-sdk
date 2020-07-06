import test from 'ava';
import { unwrapNullable } from 'option-t/lib/Nullable/unwrap';
import { createStorage } from '../storage/storage';
import { Evaluation } from '../objects/Evaluation';
import { ReasonType } from '../objects/Reason';
import { createBucketeer } from './_helper';

test('getStringVariation: when a value exists', (t) => {
  const FEATURE_ID = 'feature-id-1';
  const EXPECTED_VALUE = 'feature-flag-a';
  const storage = unwrapNullable(createStorage());
  storage.setLatestEvaluations([
    new Evaluation({
      featureId: FEATURE_ID,
      featureVersion: 0,
      userId: 'user',
      variationId: '',
      variation: {
        id: '',
        value: EXPECTED_VALUE,
      },
      reason: {
        type: ReasonType.CLIENT,
      },
    }),
  ]);
  storage.save();
  const bucketeer = createBucketeer();
  t.is(bucketeer.getStringVariation(FEATURE_ID, 'default-value-1'), EXPECTED_VALUE);
});

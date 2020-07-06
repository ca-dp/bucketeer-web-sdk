import test from 'ava';
import { createBucketeer } from './_helper';

test('getStringVariation: when default is used', (t) => {
  const EXPECTED_DEF_VALUE = 'default-value-1';
  const bucketeer = createBucketeer();
  t.is(bucketeer.getStringVariation('feature-id-1', EXPECTED_DEF_VALUE), EXPECTED_DEF_VALUE);
});

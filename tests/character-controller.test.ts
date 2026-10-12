import assert from 'node:assert/strict';
import test from 'node:test';
import { characterDisplayState } from '../src/features/character/controller.ts';

test('contract maps the native asset poses without a reward side effect', () => {
  assert.deepEqual(characterDisplayState('studying', false, true), { poseValue: 1, animate: true });
  assert.deepEqual(characterDisplayState('celebration', false, true), { poseValue: 2, animate: true });
});
test('motion policy stops animation while backgrounded or reduced motion is enabled', () => {
  assert.equal(characterDisplayState('idle', true, true).animate, false);
  assert.equal(characterDisplayState('studying', false, false).animate, false);
});

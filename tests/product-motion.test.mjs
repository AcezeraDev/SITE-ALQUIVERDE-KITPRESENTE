import test from 'node:test';
import assert from 'node:assert/strict';
import { spring, advanceSpring } from '../src/three/productMotion.js';

test('the opening feels the same at 30, 60 and 144 Hz', () => {
  const samples = [30, 60, 144].map((fps) => {
    const state = spring();
    for (let i = 0; i < fps / 2; i++) advanceSpring(state, 1, 1 / fps);
    return state.value;
  });
  assert.ok(Math.max(...samples) - Math.min(...samples) < 1e-10);
  assert.ok(samples[0] > .95 && samples[0] < 1.04);
});

test('rapid opening/closing stays bounded and settles closed', () => {
  const state = spring();
  for (let i = 0; i < 360; i++) {
    const target = i < 180 ? Math.floor(i / 13) % 2 : 0;
    advanceSpring(state, target, 1 / 60);
    assert.ok(Number.isFinite(state.value));
    assert.ok(state.value > -.05 && state.value < 1.05);
  }
  assert.ok(Math.abs(state.value) < 1e-8);
  assert.ok(Math.abs(state.velocity) < 1e-7);
});

test('a dropped frame and a reversal preserve position continuity', () => {
  const state = spring();
  for (let i = 0; i < 20; i++) advanceSpring(state, 1, 1 / 60);
  const before = state.value;
  advanceSpring(state, 0, .00001);
  assert.ok(Math.abs(state.value - before) < .0001);
  advanceSpring(state, 0, .05);
  assert.ok(Number.isFinite(state.value) && Number.isFinite(state.velocity));
});

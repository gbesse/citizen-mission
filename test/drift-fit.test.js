import test from 'node:test';
import assert from 'node:assert/strict';
import { fitPeakDrift, replay } from '../src/index.js';
test('replayed Voyager track independently reproduces the recorded drift', async () => {
  const report = await replay();
  assert.equal(report.driftAudit.samples, report.result.peakTrack.length);
  assert.ok(Math.abs(report.driftAudit.slopeHzSec - report.result.measuredPeakDriftHzSec) < 1e-5);
});
test('known synthetic MHz/second slope and residuals are unit-correct', () => {
  const track = Array.from({ length: 5 }, (_, i) => ({
    timeSec: i * 20,
    frequencyMHz: 8419.3 - (0.5 * i * 20) / 1e6,
  }));
  const fit = fitPeakDrift(track);
  assert.ok(Math.abs(fit.slopeHzSec + 0.5) < 1e-6);
  assert.ok(fit.rmseHz < 1e-5);
  assert.ok(fit.rSquared > 0.999999);
  assert.equal(fit.durationSec, 80);
  const shifted = track.map((p) => ({ ...p, timeSec: p.timeSec + 1000 }));
  assert.ok(Math.abs(fitPeakDrift(shifted).slopeHzSec - fit.slopeHzSec) < 1e-9);
});
test('constant tracks do not pretend to have defined correlation', () => {
  const fit = fitPeakDrift([
    { timeSec: 0, frequencyMHz: 1 },
    { timeSec: 1, frequencyMHz: 1 },
  ]);
  assert.equal(fit.slopeHzSec, 0);
  assert.equal(fit.rSquared, null);
});
test('invalid or unordered tracks cannot silently produce a drift', () => {
  for (const track of [
    [],
    [{ timeSec: 0, frequencyMHz: 1 }],
    [
      { timeSec: 0, frequencyMHz: 1 },
      { timeSec: 0, frequencyMHz: 2 },
    ],
    [
      { timeSec: 1, frequencyMHz: 1 },
      { timeSec: 0, frequencyMHz: 2 },
    ],
    [
      { timeSec: 0, frequencyMHz: 1 },
      { timeSec: 1, frequencyMHz: NaN },
    ],
  ])
    assert.throws(() => fitPeakDrift(track));
});

test('drift fit remains translation invariant with large representable time origins', () => {
  const track = [0, 2, 4, 6].map((timeSec) => ({ timeSec, frequencyMHz: 100 + timeSec / 1e6 }));
  const baseline = fitPeakDrift(track),
    shifted = fitPeakDrift(track.map((point) => ({ ...point, timeSec: point.timeSec + 2 ** 53 })));
  assert.ok(Math.abs(shifted.slopeHzSec - baseline.slopeHzSec) < 1e-12);
  assert.ok(Math.abs(shifted.slopeHzSec - 1) < 1e-8);
  assert.ok(Math.abs(shifted.rmseHz - baseline.rmseHz) < 1e-12);
  assert.equal(shifted.durationSec, 6);
});

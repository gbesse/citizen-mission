// Centered ordinary least squares on the exported peak track, with explicit units.
export function fitPeakDrift(track) {
  const invalid = () => {
    throw new TypeError(
      'Trace de pic finie et croissante requise / Finite increasing peak track required / Se requiere trayectoria de pico finita y creciente',
    );
  };
  if (!Array.isArray(track) || track.length < 2 || track.length > 10000) invalid();
  const finite = (value) => typeof value === 'number' && Number.isFinite(value);
  for (let i = 0; i < track.length; i++)
    if (
      !track[i] ||
      !finite(track[i].timeSec) ||
      !finite(track[i].frequencyMHz) ||
      track[i].timeSec < 0 ||
      (i && track[i].timeSec <= track[i - 1].timeSec)
    )
      invalid();
  const n = track.length,
    meanTime = track.reduce((sum, p) => sum + p.timeSec, 0) / n,
    meanFrequency = track.reduce((sum, p) => sum + p.frequencyMHz, 0) / n;
  let xx = 0,
    xy = 0,
    yy = 0;
  for (const p of track) {
    const x = p.timeSec - meanTime,
      y = (p.frequencyMHz - meanFrequency) * 1e6;
    xx += x * x;
    xy += x * y;
    yy += y * y;
  }
  const slopeHzSec = xy / xx;
  let squaredError = 0;
  for (const p of track) {
    const residual = (p.frequencyMHz - meanFrequency) * 1e6 - slopeHzSec * (p.timeSec - meanTime);
    squaredError += residual * residual;
  }
  const rmseHz = Math.sqrt(squaredError / n);
  if (![slopeHzSec, rmseHz, xx, xy, yy].every(Number.isFinite) || xx <= 0) invalid();
  return {
    method: 'centered-ordinary-least-squares',
    samples: n,
    durationSec: track.at(-1).timeSec - track[0].timeSec,
    slopeHzSec,
    rmseHz,
    rSquared: yy === 0 ? null : Math.max(0, Math.min(1, 1 - squaredError / yy)),
  };
}

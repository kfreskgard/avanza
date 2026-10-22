import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Avanza } from '../src/avanza';

test('search finds every listing of an ISIN without logging in', async () => {
  const res = await new Avanza().search('FI4000297767');
  const listings = res.hits.map(h => `${h.orderBookId} ${h.flagCode} ${h.price?.currency}`).sort();
  assert.deepEqual(listings, ['5249 SE SEK', '888677 FI EUR', '888678 DK DKK']);
});
test('search by name returns several share classes', async () => {
  const ids = (await new Avanza().search('Volvo')).hits.map(h => h.orderBookId);
  assert.ok(ids.includes('5269') && ids.includes('5268'));
});
test('getChart returns minute bars without logging in', async () => {
  // Minute resolution only accepts a span of one day, so ask for single days and
  // look back far enough to always hit a trading day, also around holidays.
  const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
  const avanza = new Avanza();
  let bars = 0;
  for (let offset = -1; offset >= -7 && bars <= 100; offset--) {
    const chart = await avanza.getChart({ instrument: '5361', resolution: 'minute', from: day(offset), to: day(offset) });
    bars = chart.ohlc.length;
  }
  assert.ok(bars > 100);
});

require('ts-node/register');

const assert = require('node:assert/strict');
const test = require('node:test');
const { getWeightedCardEntries, pickWeightedCard } = require('../features/roulette/config/rouletteConfig');

function card(id, rarity) {
  return {
    id,
    number: 1,
    name: id,
    description: id,
    rarity,
    imageUrl: '',
    isCaseExclusive: false,
    marketValue: 1,
    design: { motif: 'spark', glyph: '*', stripeAngle: 0, seed: 1 },
    createdAt: '',
  };
}

test('distributes each rarity weight across cards in its pool', () => {
  const entries = getWeightedCardEntries([card('common-a', 'common'), card('common-b', 'common'), card('rare', 'rare')]);
  assert.equal(entries[0]?.weight, 35);
  assert.equal(entries[1]?.weight, 35);
  assert.equal(entries[2]?.weight, 25);
});

test('selects the expected roulette card at deterministic boundaries', () => {
  const cards = [card('common', 'common'), card('rare', 'rare'), card('ultra', 'ultra_rare')];
  assert.equal(pickWeightedCard(cards, () => 0).id, 'common');
  assert.equal(pickWeightedCard(cards, () => 0.71).id, 'rare');
  assert.equal(pickWeightedCard(cards, () => 0.96).id, 'ultra');
});

test('rejects a roulette spin with no cards', () => {
  assert.throws(() => pickWeightedCard([]), /roulette-empty-pool/);
});

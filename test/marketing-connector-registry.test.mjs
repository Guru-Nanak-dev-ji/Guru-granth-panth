import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listMarketingConnectors,
  listReadyMarketingConnectors,
  isMarketingConnectorReady,
  marketingSafetyPolicy
} from '../server/marketing-connector-registry.mjs';

test('all marketing connectors remain disabled until official provider setup is complete', () => {
  const connectors = listMarketingConnectors();
  assert.equal(connectors.length >= 7, true);
  assert.equal(connectors.every((c) => c.ready === false), true);
  assert.deepEqual(listReadyMarketingConnectors(), []);
  assert.equal(isMarketingConnectorReady('google'), false);
  assert.equal(isMarketingConnectorReady('meta'), false);
});

test('marketing policy forbids credential scraping and silent cross-posting', () => {
  const policy = marketingSafetyPolicy();
  assert.equal(policy.officialApiOnly, true);
  assert.equal(policy.credentialScraping, false);
  assert.equal(policy.silentCrossPost, false);
  assert.equal(policy.paidAdsRequireHumanApproval, true);
  assert.equal(policy.investmentShareMarketingRequiresLegalReview, true);
});

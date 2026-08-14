import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const [host, rawPort] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':');
const environment = await initializeTestEnvironment({
  projectId: 'drift-rules-test',
  firestore: {
    host,
    port: Number(rawPort ?? 8080),
    rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8'),
  },
});

const ownerId = 'owner';
const strangerId = 'stranger';
const ownerDb = () => environment.authenticatedContext(ownerId).firestore();
const strangerDb = () => environment.authenticatedContext(strangerId).firestore();
const anonymousDb = () => environment.unauthenticatedContext().firestore();
const driftRef = (database) => doc(database, 'drifts', 'drift-1');

const drift = (authorUid = ownerId) => ({
  id: 'drift-1', authorUid, text: 'Publish a decision', stake: 'Donate $10', status: 'active',
});

test.after(async () => environment.cleanup());

test('only an authenticated author can create a drift', async () => {
  await assertFails(setDoc(anonymousDb(), driftRef(anonymousDb()), drift()));
  await assertSucceeds(setDoc(ownerDb(), driftRef(ownerDb()), drift()));
  await assertFails(setDoc(strangerDb(), driftRef(strangerDb()), drift(ownerId)));
});

test('a stranger cannot change a drift proof or status', async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(driftRef(context.firestore()), drift());
  });
  await assertFails(updateDoc(strangerDb(), driftRef(strangerDb()), { proofUrl: 'https://invalid.example/proof.jpg', status: 'executed' }));
  await assertSucceeds(updateDoc(ownerDb(), driftRef(ownerDb()), { proofUrl: 'https://example.com/proof.jpg', status: 'executed' }));
});

test('retention data remains readable only by its owner and server-writable', async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'retention', ownerId), { dayKey: '2026-08-12' });
  });
  await assertSucceeds(getDoc(doc(ownerDb(), 'retention', ownerId)));
  await assertFails(getDoc(doc(strangerDb(), 'retention', ownerId)));
  await assertFails(setDoc(doc(ownerDb(), 'retention', ownerId), { dayKey: '2026-08-13' }));
});

test('notifications can only be marked read by the recipient', async () => {
  const path = ['notifications', ownerId, 'items', 'notice-1'];
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), ...path), { isRead: false, type: 'weekly_recap' });
  });
  await assertSucceeds(updateDoc(doc(ownerDb(), ...path), { isRead: true }));
  await assertFails(updateDoc(doc(ownerDb(), ...path), { type: 'author_failed' }));
  await assertFails(updateDoc(doc(strangerDb(), ...path), { isRead: true }));
});

test('rules test environment initialized', () => assert.ok(environment));

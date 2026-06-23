import { searchDrifts } from './drifts';
import { searchUsers } from './users';
import type { Drift } from '@/types/drift';
import type { UserProfile } from '@/types/user';

export type SearchResults = {
  drifts: Drift[];
  users: UserProfile[];
};

export async function searchAll(term: string): Promise<SearchResults> {
  const [drifts, users] = await Promise.all([searchDrifts(term), searchUsers(term)]);
  return { drifts, users };
}

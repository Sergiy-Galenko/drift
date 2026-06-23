import { doc, getDoc } from 'firebase/firestore';

import { db } from './config';
import { getDrift } from './drifts';
import type { Drift, TrendingDoc } from '@/types/drift';

export type TrendingPeriod = 'hourly' | 'daily' | 'weekly';

export async function getTrending(period: TrendingPeriod): Promise<Drift[]> {
  const snapshot = await getDoc(doc(db, 'trending', period));
  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.data() as TrendingDoc;
  const drifts = await Promise.all(data.driftIds.slice(0, 20).map((id) => getDrift(id)));
  return drifts.filter((drift): drift is Drift => drift !== null);
}

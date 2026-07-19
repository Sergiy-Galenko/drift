import { collection, documentId, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

import { db } from './config';
import type { Drift, TrendingDoc } from '@/types/drift';
import { mapDrift } from './drifts';

const TRENDING_BATCH_SIZE = 30;

export type TrendingPeriod = 'hourly' | 'daily' | 'weekly';

export async function getTrending(period: TrendingPeriod): Promise<Drift[]> {
  const snapshot = await getDoc(doc(db, 'trending', period));
  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.data() as TrendingDoc;
  const ids = data.driftIds.slice(0, 20);
  if (ids.length === 0) {
    return [];
  }

  const snapshots = await Promise.all(
    Array.from({ length: Math.ceil(ids.length / TRENDING_BATCH_SIZE) }, (_, index) => {
      const batch = ids.slice(index * TRENDING_BATCH_SIZE, (index + 1) * TRENDING_BATCH_SIZE);
      return getDocs(query(collection(db, 'drifts'), where(documentId(), 'in', batch)));
    }),
  );
  const driftsById = new Map<string, Drift>();

  for (const batch of snapshots) {
    for (const document of batch.docs) {
      const drift = mapDrift(document);
      if (drift) {
        driftsById.set(drift.id, drift);
      }
    }
  }

  return ids.flatMap((id) => {
    const drift = driftsById.get(id);
    return drift ? [drift] : [];
  });
}

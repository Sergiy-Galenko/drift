export type RetentionProgress = {
  created: number;
  votes: number;
  proofs: number;
};

export type RetentionState = {
  dayKey: string;
  weekKey: string;
  daily: RetentionProgress;
  weekly: RetentionProgress;
};

export type ItemPriority = '' | 'HOT' | 'SALE' | string;

export interface DesireCacheItem {
  id: string;
  url: string;
  title: string;
  titleOverride: string;
  fetchedTitle: string;
  description: string;
  fetchedDescription: string;
  image: string;
  section: string;
  subsection: string;
  priority: ItemPriority;
  size: string;
  manualPrice: string;
  lastSeenPrice: string;
  effectivePrice: string;
  sale: boolean;
  saleOverride: boolean;
  amazon: boolean;
  source: string;
  status: string;
  hasMetadataError: boolean;
  metadataError: string;
  lastFetchedAt: string;
  priceChanged?: boolean;
}

export interface DesireCachePayload {
  generatedAt: string;
  source: string;
  totalItems: number;
  sections: string[];
  items: DesireCacheItem[];
}

export interface SkillTreeNodeData extends Record<string, unknown> {
  item: DesireCacheItem;
  branchLabel: string;
  sectionLabel: string;
}

export interface InboxItem {
  id: string;
  title: string;
  sourceType: 'text' | 'url';
  sourceUrl: string | null;
  createdAt: string;
  preview: string;
}

export interface Source {
  chunkId: string;
  itemId: string;
  title: string;
  sourceType: 'text' | 'url';
  sourceUrl: string | null;
  text: string;
  score: number;
}

export interface QueryAnswer {
  answer: string;
  sources: Source[];
}

export interface IngestResponse {
  item: InboxItem;
}

export interface ItemsResponse {
  items: InboxItem[];
}

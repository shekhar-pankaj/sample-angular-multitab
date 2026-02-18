export interface TabState {
  id: string;
  title: string;
  url: string;
  active: boolean;
  loaded: boolean;
  scrollPosition?: number;
  componentState?: any;
  createdAt: Date;
  lastAccessedAt: Date;
}

export interface TabConfig {
  title: string;
  url: string;
  reuseIfExists?: boolean;
}

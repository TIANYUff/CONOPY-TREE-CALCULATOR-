
export interface TreeItem {
  id: string;
  code?: string; // User editable code (e.g., A01, T1)
  qty: number;
  type: string;
  diameter: number;
  compliantCover?: number; // User input for actual compliant canopy area
}

export interface SoilEntry {
  id: string;
  areaId: string;
  treeIds: string[]; // References multiple TreeItem.ids
  soilAreaProvided: number;
  isCluster: boolean;
}

export interface AnalysisResponse {
  summary: string;
  recommendations: string[];
}

export interface ProjectData {
  version: string;
  timestamp: number;
  siteArea: number;
  targetPct: number;
  trees: TreeItem[];
  soilEntries: SoilEntry[];
}

// ─────────────────────────────────────────────────────────────
// FEDORA DASHBOARD CONFIG
// ─────────────────────────────────────────────────────────────

// Hero card — reads from totalProduction.summary
export const HERO_CARD = {
  title: "Dashboard",
  label: "Total Production Progress",
  summaryPath: "totalProduction.summary", // { finished, pending }
};

// Summary item sub-cards — shown below hero card, from totalProduction.summaryItem
// Each has a total count + expandable table (bmxId, feedCode, feedType — no status)
export const HERO_SUMMARY_ITEMS = [
  {
    key: "good",
    label: "Good",
    itemPath: "totalProduction.summaryItem.good", // { total, items: [...] }
  },
  {
    key: "reprocess",
    label: "Reprocess",
    itemPath: "totalProduction.summaryItem.reprocess",
  },
  {
    key: "reject",
    label: "Reject",
    itemPath: "totalProduction.summaryItem.reject",
  },
];

// Columns for summaryItem tables (no status field)
export const SUMMARY_ITEM_COLUMNS = [
  { field: "bmxId", label: "BMX ID" },
  { field: "feedCode", label: "Feed Code" },
  { field: "feedType", label: "Feed Type" },
];

// Secondary hero cards — beside the hero card
export const HERO_SECONDARY_CARDS = [
  {
    key: "reprocess",
    label: "FG Reprocess",
    summaryPath: "reprocess.summary",
    dataKey: "reprocess.data",
    columns: [
      { field: "bmxIdString", label: "BMX ID" },
      { field: "feedCode", label: "Feed Code" },
      { field: "feedType", label: "Feed Type" },
      { field: "status", label: "Status" },
    ],
  },
];

// Stat cards — bottom grid
export const DASHBOARD_CARDS = [
  {
    key: "micro",
    label: "Micro Production",
    summaryPath: "micro.summary",
    dataKey: "micro.data",
  },
  {
    key: "macro",
    label: "Macro Production",
    summaryPath: "macro.summary",
    dataKey: "macro.data",
  },
  {
    key: "basemix",
    label: "Base Mix Production",
    summaryPath: "basemix.summary",
    dataKey: "basemix.data",
  },
  {
    key: "production",
    label: "Production Units",
    summaryPath: "production.summary",
    dataKey: "production.data",
  },
  {
    key: "fg",
    label: "Finished Goods",
    summaryPath: "fg.summary",
    dataKey: "fg.data",
  },
];

// Default table columns for stat cards
export const CARD_TABLE_COLUMNS = [
  { field: "prodId", label: "Prod ID" },
  { field: "feedCode", label: "Feed Code" },
  { field: "feedType", label: "Feed Type" },
  { field: "status", label: "Status" },
];

export const STATUS_THRESHOLDS = { complete: 100, halfway: 50 };
export const HERO_CIRCLE_SIZE = 110;
export const POLLING_INTERVAL = 60000;

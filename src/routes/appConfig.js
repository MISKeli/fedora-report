import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import DashboardPage from "../Pages/Dashboard/DashboardPage";
import FGInventoryPage from "../Pages/FGInventory/FGInventoryPage";
import OrderSummaryPage from "../Pages/OrderSummary/OrderSummaryPage";
import MoveOrderRecordPage from "../Pages/MoveOrderRecord/MoveOrderRecordPage";
import ConsolidatedReportFinancePage from "../Pages/Reports/ConsolidatedReportFinancePage";
import Inventory2Rounded from "@mui/icons-material/Inventory2Rounded";
import InventoryOutlined from "@mui/icons-material/InventoryOutlined";
import MoveToInboxOutlined from "@mui/icons-material/MoveToInboxOutlined";
import MoveToInboxRounded from "@mui/icons-material/MoveToInboxRounded";
import SummarizeOutlined from "@mui/icons-material/SummarizeOutlined";
import SummarizeRounded from "@mui/icons-material/SummarizeRounded";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import AssessmentRounded from "@mui/icons-material/Assessment";
import AccountBalanceWalletOutlined from "@mui/icons-material/AccountBalanceWalletOutlined";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceOutlined from "@mui/icons-material/AccountBalanceOutlined";
import AccountBalanceRounded from "@mui/icons-material/AccountBalanceRounded";
import EditDocument from "@mui/icons-material/EditDocument";
import PrecisionManufacturing from "@mui/icons-material/PrecisionManufacturing";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import TuneRounded from "@mui/icons-material/TuneRounded";
import RepackingAdjustmentPage from "../Pages/RepackingAdjustment/RepackingAdjustmentPage";
import PreparationAdjustmentPage from "../Pages/PreparationAdjustment/PreparationAdjustmentPage";

export const appConfig = [
  {
    name: "Dashboard",
    section: "dashboard",
    path: "/",
    component: DashboardPage,
    icon: DashboardOutlined,
    iconActive: DashboardRounded,
    permissions: ["Dashboard"],
    roles: null, // accessible by all roles
    showInNav: true,
    children: null,
  },
  {
    name: "FG Inventory",
    section: "fg-inventory",
    path: "/fg-inventory",
    component: FGInventoryPage,
    icon: InventoryOutlined,
    iconActive: Inventory2Rounded,
    permissions: ["FG Inventory"],
    roles: null,
    showInNav: true,
    children: null,
  },
  {
    name: "Order Summary",
    section: "order-summary",
    path: "/order-summary",
    component: OrderSummaryPage,
    icon: SummarizeOutlined,
    iconActive: SummarizeRounded,
    permissions: ["Order Summary"],
    roles: null,
    showInNav: true,
    children: null,
  },
  {
    name: "Move Order Record",
    section: "move-order-record",
    path: "/move-order-record",
    component: MoveOrderRecordPage,
    icon: MoveToInboxOutlined,
    iconActive: MoveToInboxRounded,
    permissions: ["Move Order Record"],
    roles: null,
    showInNav: true,
    children: null,
  },

  // ── Admin-only section ──────────────────────────────────────────────────────
  {
    name: "Adjustment",
    section: "adjustment",
    path: "/adjustment",
    component: null,
    icon: EditDocument,
    iconActive: EditDocument,
    permissions: null,
    roles: ["admin"], // ← matches state.auth.user === "admin" from login response
    showInNav: true,
    children: [
      {
        name: "Repacking Adjustment",
        section: "repacking-adjustment",
        path: "/repacking-adjustment",
        component: RepackingAdjustmentPage,
        icon: TuneOutlined,
        iconActive: TuneRounded,
        permissions: null, // ← no permission needed, role check is enough
        roles: ["admin"],
        showInNav: true,
        children: null,
      },
      {
        name: "Preparation Adjustment",
        section: "preparation-adjustment",
        path: "/preparation-adjustment",
        component: PreparationAdjustmentPage,
        icon: PrecisionManufacturing,
        iconActive: PrecisionManufacturing,
        permissions: null, // ← no permission needed, role check is enough
        roles: ["admin"],
        showInNav: true,
        children: null,
      },
    ],
  },
  // ───────────────────────────────────────────────────────────────────────────

  // {
  //   name: "Reports",
  //   section: "reports",
  //   path: "/reports",
  //   component: null,
  //   icon: AssessmentOutlined,
  //   iconActive: AssessmentRounded,
  //   roles: null,
  //   showInNav: true,
  //   children: [
  //     {
  //       name: "Consolidated Report (Finance)",
  //       section: "consolidated-report-finance",
  //       path: "/consolidated-finance",
  //       component: ConsolidatedReportFinancePage,
  //       icon: AccountBalanceWalletOutlined,
  //       iconActive: AccountBalanceWallet,
  //       permissions: ["Move Order Record"],
  //       roles: null,
  //       showInNav: true,
  //       children: null,
  //     },
  //     {
  //       name: "Consolidated Report (Audit)",
  //       section: "consolidated-report-audit",
  //       path: "/consolidated-audit",
  //       component: ConsolidatedReportFinancePage,
  //       icon: AccountBalanceOutlined,
  //       iconActive: AccountBalanceRounded,
  //       permissions: ["Move Order Record"],
  //       roles: null,
  //       showInNav: true,
  //       children: null,
  //     },
  //   ],
  // },
];

// ===== UTILITY FUNCTIONS =====

/**
 * Check if the current user satisfies an item's role requirement.
 * - roles: null       → no restriction, everyone can access
 * - roles: ["admin"]  → only users where state.auth.user === "admin"
 *
 * Usage:
 *   const authUser = useSelector((state) => state.auth.user);
 *   hasRole(item.roles, authUser)  // authUser = "admin" | "user" | etc.
 *
 * @param {string[]|null} itemRoles - roles defined on the config item
 * @param {string}        authUser  - value of state.auth.user from login response
 */
export const hasRole = (itemRoles, authUser = "") => {
  if (!itemRoles || itemRoles.length === 0) return true;
  return itemRoles.includes(authUser); // "admin" === "admin" ✅
};

export const generateFullPath = (item, parentPath = "") => {
  if (!parentPath) return item.path;
  const currentPath = `${parentPath}${item.path.startsWith("/") ? "" : "/"}${item.path}`;
  return currentPath === "//" ? "/" : currentPath;
};

// Flat list of nav items — filters by role
export const getNavigationItems = (
  config = appConfig,
  parentPath = "",
  userRole = "",
) => {
  const items = [];

  config.forEach((item) => {
    const fullPath = generateFullPath(item, parentPath);

    // Skip items the user's role can't access
    if (!hasRole(item.roles, userRole)) return;

    if (item.showInNav) {
      items.push({
        ...item,
        fullPath,
        hasChildren: item.children && item.children.some((c) => c.showInNav),
        isParent: !!item.children,
      });
    }

    if (item.children) {
      items.push(...getNavigationItems(item.children, fullPath, userRole));
    }
  });

  return items;
};

// Hierarchical nav — filters by role
export const getHierarchicalNavigation = (
  config = appConfig,
  parentPath = "",
  userRole = "",
) => {
  return config
    .filter((item) => item.showInNav && hasRole(item.roles, userRole))
    .map((item) => {
      const fullPath = generateFullPath(item, parentPath);
      return {
        ...item,
        fullPath,
        children: item.children
          ? getHierarchicalNavigation(item.children, fullPath, userRole)
          : null,
      };
    });
};

export const getRoutePermissions = (config = appConfig, parentPath = "") => {
  const permissions = new Map();

  config.forEach((item) => {
    const fullPath = generateFullPath(item, parentPath);
    if (item.permissions) permissions.set(fullPath, item.permissions);
    if (item.children) {
      const childPerms = getRoutePermissions(item.children, fullPath);
      childPerms.forEach((perms, path) => permissions.set(path, perms));
    }
  });

  return permissions;
};

export const findItemBySection = (section, config = appConfig) => {
  for (const item of config) {
    if (item.section === section) return item;
    if (item.children) {
      const found = findItemBySection(section, item.children);
      if (found) return found;
    }
  }
  return null;
};

export const findItemByPath = (path, config = appConfig, parentPath = "") => {
  for (const item of config) {
    const fullPath = generateFullPath(item, parentPath);
    if (fullPath === path) return item;
    if (item.children) {
      const found = findItemByPath(path, item.children, fullPath);
      if (found) return found;
    }
  }
  return null;
};

export const hasActiveChild = (item, currentPath, parentPath = "") => {
  if (!item.children) return false;
  return item.children.some((child) => {
    const childFullPath = generateFullPath(
      child,
      generateFullPath(item, parentPath),
    );
    return (
      currentPath.startsWith(childFullPath) ||
      hasActiveChild(child, currentPath, generateFullPath(item, parentPath))
    );
  });
};

export const getFirstAccessibleChild = (item, userPermissions = []) => {
  if (!item.children) return null;
  for (const child of item.children) {
    if (child.showInNav && hasPermission(child.permissions, userPermissions)) {
      return child;
    }
    if (child.children) {
      const grandChild = getFirstAccessibleChild(child, userPermissions);
      if (grandChild) return grandChild;
    }
  }
  return null;
};

const hasPermission = (itemPermissions, userPermissions = []) => {
  if (!itemPermissions || itemPermissions.length === 0) return true;
  return itemPermissions.some((p) => userPermissions.includes(p));
};

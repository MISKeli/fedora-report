import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import DashboardPage from "../Pages/Dashboard/DashboardPage";
import FGInventoryPage from "../Pages/FGInventory/FGInventoryPage";
import OrderSummaryPage from "../Pages/OrderSummary/OrderSummaryPage";
import MoveOrderRecordPage from "../Pages/MoveOrderRecord/MoveOrderRecordPage";
import ConsolidatedReportFinancePage from "../Pages/Reports/ConsolidatedReportFinancePage"; // New page component
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
import {
  AccountBalanceOutlined,
  AccountBalanceRounded,
} from "@mui/icons-material";

export const appConfig = [
  {
    name: "Dashboard",
    section: "dashboard",
    path: "/",
    component: DashboardPage,
    icon: DashboardOutlined,
    iconActive: DashboardRounded,
    permissions: ["Dashboard"],
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
    showInNav: true,
    children: null,
  },
  {
    name: "Reports",
    section: "reports",
    path: "/reports", // Parent path - can be empty or redirect to first child
    component: null, // No direct component for parent
    icon: AssessmentOutlined,
    iconActive: AssessmentRounded,
    //permissions: ["Move Order Record"], // Parent permission
    showInNav: true,
    children: [
      {
        name: "Consolidated Report (Finance)",
        section: "consolidated-report-finance",
        path: "/consolidated-finance", // This will become /reports/consolidated-finance
        component: ConsolidatedReportFinancePage,
        icon: AccountBalanceWalletOutlined,
        iconActive: AccountBalanceWallet,
        permissions: ["Move Order Record"],
        showInNav: true,
        children: null,
      },
      {
        name: "Consolidated Report (Audit)",
        section: "consolidated-report-audit",
        path: "/consolidated-audit", // This will become /reports/consolidated-finance
        component: ConsolidatedReportFinancePage,
        icon: AccountBalanceOutlined,
        iconActive: AccountBalanceRounded,
        permissions: ["Move Order Record"],
        showInNav: true,
        children: null,
      },
      //     // You can add more report subcategories here
      //     // {
      //     //   name: "Sales Report",
      //     //   section: "sales-report",
      //     //   path: "/sales",
      //     //   component: SalesReportPage,
      //     //   icon: TrendingUpOutlined,
      //     //   iconActive: TrendingUp,
      //     //   permissions: ["Sales Report"],
      //     //   showInNav: true,
      //     //   children: null,
      //     // },
    ],
  },
];

// ===== UTILITY FUNCTIONS =====

export const generateFullPath = (item, parentPath = "") => {
  // If no parent path, just return the item path as is
  if (!parentPath) {
    return item.path;
  }

  // If there's a parent path, combine them properly
  const currentPath = `${parentPath}${item.path.startsWith("/") ? "" : "/"}${
    item.path
  }`;
  return currentPath === "//" ? "/" : currentPath;
};

// Get all navigation items (flattened) - updated to handle nested items
export const getNavigationItems = (config = appConfig, parentPath = "") => {
  const items = [];

  config.forEach((item) => {
    const fullPath = generateFullPath(item, parentPath);

    if (item.showInNav) {
      items.push({
        ...item,
        fullPath,
        hasChildren:
          item.children && item.children.some((child) => child.showInNav),
        isParent: !!item.children,
      });
    }

    if (item.children) {
      items.push(...getNavigationItems(item.children, fullPath));
    }
  });

  return items;
};

// Get hierarchical navigation (for nested navigation)
export const getHierarchicalNavigation = (
  config = appConfig,
  parentPath = ""
) => {
  return config
    .filter((item) => item.showInNav)
    .map((item) => {
      const fullPath = generateFullPath(item, parentPath);

      return {
        ...item,
        fullPath,
        children: item.children
          ? getHierarchicalNavigation(item.children, fullPath)
          : null,
      };
    });
};

// Get route permissions map
export const getRoutePermissions = (config = appConfig, parentPath = "") => {
  const permissions = new Map();

  config.forEach((item) => {
    const fullPath = generateFullPath(item, parentPath);

    if (item.permissions) {
      permissions.set(fullPath, item.permissions);
    }

    if (item.children) {
      const childPermissions = getRoutePermissions(item.children, fullPath);
      childPermissions.forEach((perms, path) => {
        permissions.set(path, perms);
      });
    }
  });

  return permissions;
};

// Find item by section
export const findItemBySection = (section, config = appConfig) => {
  for (const item of config) {
    if (item.section === section) {
      return item;
    }
    if (item.children) {
      const found = findItemBySection(section, item.children);
      if (found) return found;
    }
  }
  return null;
};

// Find item by path - updated to handle nested paths better
export const findItemByPath = (path, config = appConfig, parentPath = "") => {
  for (const item of config) {
    const fullPath = generateFullPath(item, parentPath);

    if (fullPath === path) {
      return item;
    }
    if (item.children) {
      const found = findItemByPath(path, item.children, fullPath);
      if (found) return found;
    }
  }

  return null;
};

// New helper function to check if a parent has any active children
export const hasActiveChild = (item, currentPath, parentPath = "") => {
  if (!item.children) return false;

  return item.children.some((child) => {
    const childFullPath = generateFullPath(
      child,
      generateFullPath(item, parentPath)
    );
    return (
      currentPath.startsWith(childFullPath) ||
      hasActiveChild(child, currentPath, generateFullPath(item, parentPath))
    );
  });
};

// New helper function to get the first accessible child route
export const getFirstAccessibleChild = (item, userPermissions = []) => {
  if (!item.children) return null;

  for (const child of item.children) {
    if (child.showInNav && hasPermission(child.permissions, userPermissions)) {
      return child;
    }

    // If child has children, check recursively
    if (child.children) {
      const grandChild = getFirstAccessibleChild(child, userPermissions);
      if (grandChild) return grandChild;
    }
  }

  return null;
};

// Helper function to check permissions
const hasPermission = (itemPermissions, userPermissions = []) => {
  if (!itemPermissions || itemPermissions.length === 0) return true;
  return itemPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
};

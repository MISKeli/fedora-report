import { createBrowserRouter } from "react-router-dom";
import { appConfig, findItemByPath } from "./appConfig";
import { LoginRoute } from "../Pages/Login/LoginRoute";
import PrivateRoutes from "../routes/PrivateRoutes";
import MainLayout from "../Pages/Layout/MainLayout";

import React from "react";
import NotFoundPage from "../Pages/PageNotFound/NotFoundPage";

// ===== ROUTE GENERATOR =====
const generateRoutes = (config, parentPath = "") => {
  const routes = [];

  config.forEach((item) => {
    const fullPath = parentPath
      ? `${parentPath}${item.path.startsWith("/") ? "" : "/"}${item.path}`
      : item.path;

    // Handle items with components (leaf nodes or parents with direct components)
    if (item.component) {
      routes.push({
        path: item.path,
        element: React.createElement(item.component),
        handle: {
          ...(item.permissions && { permissions: item.permissions }),
          title: item.name,
          section: item.section,
          icon: item.icon,
          iconActive: item.iconActive,
        },
      });
    }

    // Handle children - flatten them into the same level
    if (item.children && item.children.length > 0) {
      const childRoutes = generateRoutes(item.children, fullPath);
      routes.push(...childRoutes);
    }
  });

  return routes;
};

// Alternative approach: Generate all routes flattened with full paths
const generateFlatRoutes = (config, parentPath = "") => {
  const routes = [];

  config.forEach((item) => {
    // Calculate the full path
    let fullPath;
    if (parentPath === "" && item.path === "/") {
      fullPath = "/";
    } else if (parentPath === "") {
      fullPath = item.path;
    } else {
      // Remove leading slash from item.path if parentPath doesn't end with slash
      const cleanItemPath = item.path.startsWith("/")
        ? item.path.substring(1)
        : item.path;
      fullPath = `${parentPath}/${cleanItemPath}`;
    }

    // Only create routes for items with components
    if (item.component) {
      routes.push({
        path: fullPath,
        element: React.createElement(item.component),
        handle: {
          ...(item.permissions && { permissions: item.permissions }),
          title: item.name,
          section: item.section,
          icon: item.icon,
          iconActive: item.iconActive,
          fullPath: fullPath,
        },
      });
    }

    // Process children recursively
    if (item.children && item.children.length > 0) {
      const childRoutes = generateFlatRoutes(item.children, fullPath);
      routes.push(...childRoutes);
    }
  });

  return routes;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: generateFlatRoutes(appConfig),
      },
    ],
  },
  {
    path: "/unauthorized",
    element: (
      <div className="unauthorized-page">
        <h1>Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

// ===== EXPORT UTILITIES =====
export {
  getNavigationItems,
  getHierarchicalNavigation,
  getRoutePermissions,
} from "./appConfig";

// Export the configuration for other uses
export { appConfig } from "./appConfig";

// Get breadcrumb data for current route - UPDATED to handle nested paths
export const getBreadcrumbs = (pathname) => {
  const breadcrumbs = [];
  const pathSegments = pathname.split("/").filter(Boolean);

  // Helper function to find item recursively
  const findItemInConfig = (config, targetPath, currentPath = "") => {
    for (const item of config) {
      const itemFullPath = currentPath
        ? `${currentPath}${item.path.startsWith("/") ? "" : "/"}${item.path}`
        : item.path;

      if (itemFullPath === targetPath) {
        return item;
      }

      if (item.children) {
        const found = findItemInConfig(item.children, targetPath, itemFullPath);
        if (found) return found;
      }
    }
    return null;
  };

  // Build breadcrumbs by checking each path segment
  let currentPath = "";
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += `/${pathSegments[i]}`;

    const item = findItemInConfig(appConfig, currentPath);
    if (item) {
      breadcrumbs.push({
        name: item.name,
        path: currentPath,
        section: item.section,
      });
    }
  }

  // If no breadcrumbs found and we're not on root, try to find the exact path
  if (breadcrumbs.length === 0 && pathname !== "/") {
    const item = findItemInConfig(appConfig, pathname);
    if (item) {
      breadcrumbs.push({
        name: item.name,
        path: pathname,
        section: item.section,
      });
    }
  }

  return breadcrumbs;
};

// Get page title for current route - UPDATED
export const getPageTitle = (pathname) => {
  const findItemInConfig = (config, targetPath, currentPath = "") => {
    for (const item of config) {
      const itemFullPath = currentPath
        ? `${currentPath}${item.path.startsWith("/") ? "" : "/"}${item.path}`
        : item.path;

      if (itemFullPath === targetPath) {
        return item;
      }

      if (item.children) {
        const found = findItemInConfig(item.children, targetPath, itemFullPath);
        if (found) return found;
      }
    }
    return null;
  };

  const item = findItemInConfig(appConfig, pathname);
  return item ? item.name : "Page Not Found";
};

// Check if route is active (for navigation highlighting)
export const isRouteActive = (routePath, currentPath) => {
  if (routePath === "/" && currentPath === "/") return true;
  if (routePath === "/") return false;
  return currentPath.startsWith(routePath);
};

// Debug function to see all generated routes
export const getGeneratedRoutes = () => {
  return generateFlatRoutes(appConfig);
};

// Helper function to log all routes (for debugging)
export const logAllRoutes = () => {
  console.log("Generated Routes:", generateFlatRoutes(appConfig));
};

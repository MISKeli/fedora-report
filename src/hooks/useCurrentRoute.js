import { useLocation } from "react-router-dom";
import { findItemByPath } from "../routes/appConfig";

export const useCurrentRoute = () => {
  const location = useLocation();

  const currentRouteConfig = findItemByPath(location.pathname);


  return {
    config: currentRouteConfig,
    icon: currentRouteConfig?.icon,
    iconActive: currentRouteConfig?.iconActive,
    title: currentRouteConfig?.name,
    section: currentRouteConfig?.section,
    permissions: currentRouteConfig?.permissions,
  };
};

import { useLocation } from "react-router-dom";
import { findItemByPath } from "../routes/appConfig";

export const useCurrentRoute = () => {
  const location = useLocation();
  //console.log("🚀 ~ useCurrentRoute ~ location:", location)
  const currentRouteConfig = findItemByPath(location.pathname);
  //console.log("🚀 ~ useCurrentRoute ~ currentRouteConfig:", currentRouteConfig)

  return {
    config: currentRouteConfig,
    icon: currentRouteConfig?.icon,
    iconActive: currentRouteConfig?.iconActive,
    title: currentRouteConfig?.name,
    section: currentRouteConfig?.section,
    permissions: currentRouteConfig?.permissions,
  };
};

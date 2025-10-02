import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  Collapse,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Logout,
  Person,
  Settings,
} from "@mui/icons-material";
import "../../styles/Layout/SideBar.scss";
import fedoraLogo from "../../assets/images/fedora-icon.svg";
import {
  appConfig,
  generateFullPath,
  hasActiveChild,
  getFirstAccessibleChild,
} from "../../routes/appConfig";
import { info } from "../../schema/info";
import { logoutSlice } from "../../features/slice/authSlice";

const SideBar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Get user permissions from session storage
  const user = JSON.parse(sessionStorage.getItem("user"));
  const userPermissions = user?.permission || [];
  const userName = user?.name || user?.user || "User";
  const userRole = user?.user || "Admin";

  // Menu state
  const isMenuOpen = Boolean(anchorEl);

  // Check if user has permission for a menu item
  const hasPermission = (itemPermissions) => {
    if (!itemPermissions || itemPermissions.length === 0) return true;
    return itemPermissions.some((permission) =>
      userPermissions.includes(permission)
    );
  };

  // Auto-expand parent items if their children are active
  useEffect(() => {
    const checkAndExpandParents = (
      items,
      parentPath = "",
      newExpanded = new Set()
    ) => {
      items.forEach((item) => {
        const fullPath = generateFullPath(item, parentPath);

        if (
          item.children &&
          hasActiveChild(item, location.pathname, parentPath)
        ) {
          newExpanded.add(item.section);
          // Recursively check children
          checkAndExpandParents(item.children, fullPath, newExpanded);
        }
      });
      return newExpanded;
    };

    const newExpanded = checkAndExpandParents(appConfig);
    setExpandedItems(newExpanded);
  }, [location.pathname]);

  // Toggle expansion of menu items
  const toggleExpanded = (section, event) => {
    event.stopPropagation();
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Render menu items recursively
  const renderMenuItems = (items, parentPath = "", depth = 0) => {
    return items
      .filter((item) => item.showInNav && hasPermission(item.permissions))
      .map((item) => {
        const fullPath = generateFullPath(item, parentPath);
        const hasChildren =
          item.children &&
          item.children.some(
            (child) => child.showInNav && hasPermission(child.permissions)
          );
        const isExpanded = expandedItems.has(item.section);
        const isActive = isActiveItem(item, fullPath);
        const isParentActive =
          hasChildren && hasActiveChild(item, location.pathname, parentPath);

        const IconComponent =
          isActive || isParentActive ? item.iconActive : item.icon;

        return (
          <React.Fragment key={item.section}>
            <ListItem
              className={`side__menu-item ${
                depth > 0 ? "side__menu-item--nested" : ""
              }`}
              disablePadding
              sx={{
                pl: depth * 2, // Indent nested items
              }}
            >
              <ListItemButton
                className={`side__menu-button ${
                  isActive || isParentActive ? "side__menu-button--active" : ""
                }`}
                onClick={(e) => handleMenuClick(item, fullPath, e)}
                sx={{
                  minHeight: 48,
                  justifyContent: isOpen ? "initial" : "center",
                  px: 2.5,
                  ml: depth > 0 ? 1 : 0, // Additional margin for nested items
                }}
              >
                <ListItemIcon
                  className="side__menu-icon"
                  sx={{
                    minWidth: 0,
                    mr: isOpen ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <IconComponent fontSize="small" />
                </ListItemIcon>

                {isOpen && (
                  <>
                    <ListItemText
                      primary={item.name}
                      className="side__menu-text"
                      sx={{ opacity: isOpen ? 1 : 0, flex: 1 }}
                    />

                    {hasChildren && (
                      <Box
                        className="side__menu-expand-icon"
                        onClick={(e) => toggleExpanded(item.section, e)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          p: 0.5,
                          ml: 1,
                          borderRadius: 1,
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        {isExpanded ? (
                          <KeyboardArrowDown fontSize="small" />
                        ) : (
                          <KeyboardArrowRight fontSize="small" />
                        )}
                      </Box>
                    )}
                  </>
                )}
              </ListItemButton>
            </ListItem>

            {/* Render children with collapse animation */}
            {hasChildren && isOpen && (
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {renderMenuItems(item.children, fullPath, depth + 1)}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        );
      });
  };

  // Check if item is active
  const isActiveItem = (item, fullPath) => {
    if (item.path === "/") {
      return location.pathname === "/";
    }

    // For items with children, they're active if the current path starts with their path
    if (item.children) {
      return (
        location.pathname.startsWith(fullPath) && location.pathname !== "/"
      );
    }

    return location.pathname === fullPath;
  };

  // Handle menu item click
  const handleMenuClick = (item, fullPath, event) => {
    // If item has children and sidebar is open
    if (item.children && isOpen) {
      // If it's a parent item, either navigate to first child or just expand
      if (!item.component) {
        // Just toggle expansion for parent items without components
        toggleExpanded(item.section, event);
        return;
      }
    }

    // Navigate to the item or its first accessible child
    let targetPath = fullPath;

    if (item.children && !item.component) {
      // Navigate to first accessible child if parent has no component
      const firstChild = getFirstAccessibleChild(item, userPermissions);
      if (firstChild) {
        targetPath = generateFullPath(firstChild, fullPath);
      }
    }

    if (targetPath === "/" || targetPath) {
      navigate(targetPath);

      // Close sidebar on mobile/small screens
      if (window.innerWidth <= 768) {
        onClose();
      }
    }
  };

  // User menu handlers
  const handleToggleUserMenu = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  // Logout handler
  const handleLogout = () => {
    dispatch(logoutSlice());
    sessionStorage.clear();
    handleCloseUserMenu();
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <Box
          className="side__overlay"
          onClick={onClose}
          sx={{
            display: { xs: "block", md: "none" },
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1200,
          }}
        />
      )}

      <Box className={`side ${isOpen ? "side--open" : "side--closed"}`}>
        {/* Header */}
        <Box className="side__container side__container--header">
          <Box className="side__header">
            <img src={fedoraLogo} className="side__logo" alt="fedora Logo" />
            {isOpen && (
              <Box className="side__logo-text">{info.fedora.title}</Box>
            )}
          </Box>
        </Box>

        {/* Navigation Menu */}
        <Box className="side__container side__container--content">
          <List className="side__menu">{renderMenuItems(appConfig)}</List>
        </Box>

        {/* Footer with User Menu */}
        <Box className="side__container side__container--footer">
          <Box className="side__user-menu">
            <ListItemButton
              className="side__user-menu-button"
              onClick={handleToggleUserMenu}
              sx={{
                borderRadius: 1,
                padding: "8px 12px",
                margin: "4px 8px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                },
                justifyContent: isOpen ? "initial" : "center",
              }}
            >
              <Avatar
                className="side__user-avatar"
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 14,
                  mr: isOpen ? 1.5 : 0,
                  bgcolor: "primary.main",
                  transition: "margin-right 0.3s ease",
                }}
              >
                {getUserInitials(userName)}
              </Avatar>
              {isOpen && (
                <Box className="side__user-info" sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    className="side__user-name"
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgb(46, 40, 40)",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      opacity: isOpen ? 1 : 0,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    {userName}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="side__user-role"
                    sx={{
                      fontSize: 11,
                      color: "rgb(97, 97, 97)",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      opacity: isOpen ? 1 : 0,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    {userRole}
                  </Typography>
                </Box>
              )}
              {isOpen && (
                <KeyboardArrowDown
                  className="side__user-menu-arrow"
                  sx={{
                    fontSize: 18,
                    color: "rgb(97, 97, 97)",
                    transition: "transform 0.3s ease, opacity 0.3s ease",
                    transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    opacity: isOpen ? 1 : 0,
                  }}
                />
              )}
            </ListItemButton>
          </Box>
        </Box>
      </Box>

      {/* User Menu Dropdown */}
      <Menu
        className="side__user-dropdown"
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseUserMenu}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            minWidth: 200,
            mt: -1,
          },
        }}
      >
        {/* User Info in Menu */}
        <Box className="side__user-dropdown-header" sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: 14,
                mr: 1.5,
                bgcolor: "primary.main",
              }}
            >
              {getUserInitials(userName)}
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "rgb(46, 40, 40)",
                  lineHeight: 1.2,
                }}
              >
                {userName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 12,
                  color: "rgb(97, 97, 97)",
                  lineHeight: 1.2,
                }}
              >
                {userRole}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Menu Items */}
        <MenuItem onClick={handleCloseUserMenu}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>

        <MenuItem onClick={handleCloseUserMenu}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default SideBar;

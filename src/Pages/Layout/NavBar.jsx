import {
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import "../../styles/Layout/NavBar.scss";
import { useDispatch } from "react-redux";
import moment from "moment/moment";
import { KeyboardArrowDown, Logout, ViewSidebar } from "@mui/icons-material";
import { logoutSlice } from "../../features/slice/authSlice";

const NavBar = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const currentDate = moment().format("ddd, MMM Do, YYYY");

  const handleToggleMenu = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSidebarToggle = () => {
    onToggleSidebar();
  };

  //Logout
  const logout = () => {
    dispatch(logoutSlice());
    sessionStorage.clear();
    handleCloseMenu();
  };

  // for getting user Data
  const user = JSON.parse(sessionStorage.getItem("user"));
  const userPermissions = user?.permission || [];

  const isMenuOpen = Boolean(anchorEl);

  return (
    <>
      <Box className="nav">
        <Box className="nav__container">
          <Box className="nav__container__side-menu">
            <IconButton
              onClick={handleSidebarToggle}
              className="nav__sidebar-toggle"
              size="small"
            >
              <ViewSidebar fontSize="small" color="primary" />
            </IconButton>
          </Box>
          <Box className="nav__container__date">
            <Typography  fontWeight={"bolder"}>{currentDate}</Typography>
          </Box>
        </Box>
      </Box>

     
    </>
  );
};

export default NavBar;

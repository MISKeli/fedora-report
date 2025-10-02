import Box from "@mui/material/Box";
import React, { useState, useEffect } from "react";
import SideBar from "./SideBar";
import NavBar from "./NavBar";
import { Outlet } from "react-router-dom";
import "../../styles/Layout/MainPage.scss";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      <Box className="main">
        <Box
          className={`main__sidebar ${
            sidebarOpen ? "main__sidebar--open" : "main__sidebar--closed"
          }`}
        >
          <SideBar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
        </Box>
        <Box
          className={`main__content ${
            sidebarOpen
              ? "main__content--sidebar-open"
              : "main__content--sidebar-closed"
          }`}
        >
          <NavBar onToggleSidebar={handleToggleSidebar} />
          <Box className="main__content__outlet">
            <Outlet />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MainLayout;

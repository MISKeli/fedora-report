import React from "react";
import { Box, Typography } from "@mui/material";
import { useCurrentRoute } from "../../hooks/useCurrentRoute";

const PageHeader = ({ title, customIcon, showIcon = true }) => {
  const { iconActive, icon, config } = useCurrentRoute();

  // Use custom icon if provided, otherwise use route config icon
  const IconComponent = customIcon || iconActive || icon;

  return (
    <Box className="pageHeader">
      <Box
        className="pageHeader__container"
        sx={{ display: "flex", alignItems: "center" }}
      >
        {showIcon && IconComponent && (
          <IconComponent
            sx={{
              //fontSize: "large",
              marginRight: 1,

              color: "primary.main",
            }}
          />
        )}
        <Typography variant="h5" className="pageHeader__title">
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default PageHeader;

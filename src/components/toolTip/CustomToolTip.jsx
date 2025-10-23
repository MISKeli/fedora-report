import React from "react";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

/**
 * CustomTooltip component
 * Props:
 *  - title: tooltip text or node
 *  - bgcolor: background color (string)
 *  - color: text color (string)
 *  - fontSize: font size (optional)
 *  - children: element to wrap
 */
const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} placement="left" />
))(({ theme, bgcolor, color, fontSize }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: bgcolor || theme.palette.grey[800],
    color: color || "#fff",
    fontSize: fontSize || 13,
    fontWeight: 500,
    borderRadius: 8,
    padding: "8px 12px",
    boxShadow: theme.shadows[2],
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: bgcolor || theme.palette.grey[800],
  },
}));

export default CustomTooltip;

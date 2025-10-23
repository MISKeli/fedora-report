import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  KeyboardArrowDown,
  FileDownload,
  TableChart,
  Print,
  PictureAsPdf,
} from "@mui/icons-material";

const ExportMenu = ({
  onExcelExport,
  onPrintExport,
  excelLabel,
  isExporting = false,
  disabled = false,
  variant = "outlined",
  size = "small",
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleToggleMenu = (event) => {
    if (disabled || isExporting) return;
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleExcelExport = () => {
    handleCloseMenu();
    if (onExcelExport) {
      onExcelExport();
    }
  };

  const handlePrintExport = () => {
    handleCloseMenu();
    if (onPrintExport) {
      onPrintExport();
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleToggleMenu}
        disabled={disabled || isExporting}
        endIcon={
          isExporting ? (
            <CircularProgress size={16} />
          ) : (
            <KeyboardArrowDown
              sx={{
                transition: "transform 0.3s ease",
                transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          )
        }
        startIcon={<FileDownload />}
        sx={{
          minWidth: 120,
          textTransform: "none",
          borderRadius: 1,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor:
              variant === "outlined" ? "rgba(25, 118, 210, 0.04)" : undefined,
          },
        }}
      >
        {isExporting ? "Exporting..." : "Export"}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            minWidth: 180,
            mt: 1,
            boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
          },
        }}
      >
        {/* Export Header */}
        <div style={{ padding: "12px 16px 8px 16px" }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgb(97, 97, 97)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Export Options
          </Typography>
        </div>

        <Divider sx={{ mx: 1 }} />

        {/* Excel Export */}
        <MenuItem
          onClick={handleExcelExport}
          disabled={isExporting}
          sx={{
            py: 1.5,
            px: 2,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.08)",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: "rgb(25, 118, 210)",
            }}
          >
            <TableChart fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Export"
            secondary= {excelLabel || "Download as .xlsx file"}
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 500,
              color: "rgb(46, 40, 40)",
            }}
            secondaryTypographyProps={{
              fontSize: 12,
              color: "rgb(97, 97, 97)",
            }}
          />
        </MenuItem>

        {/* Print Export */}
        <MenuItem
          onClick={handlePrintExport}
          //disabled={true}
          sx={{
            py: 1.5,
            px: 2,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.08)",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: "rgb(108, 117, 125)",
            }}
          >
            <Print fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Print"
            secondary="Preview and print"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 500,
              color: "rgb(46, 40, 40)",
            }}
            secondaryTypographyProps={{
              fontSize: 12,
              color: "rgb(97, 97, 97)",
            }}
          />
        </MenuItem>

        {/* Future: PDF Export (disabled for now) */}
        <MenuItem
          disabled={true}
          sx={{
            py: 1.5,
            px: 2,
            opacity: 0.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: "rgb(220, 53, 69)",
            }}
          >
            <PictureAsPdf fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Export to PDF"
            secondary="Coming soon..."
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 500,
              color: "rgb(46, 40, 40)",
            }}
            secondaryTypographyProps={{
              fontSize: 12,
              color: "rgb(97, 97, 97)",
            }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportMenu;

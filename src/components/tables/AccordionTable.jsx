// AccordionTable.js - Enhanced table with accordion functionality
import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  CircularProgress,
  Typography,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  KeyboardArrowUp,
} from "@mui/icons-material";
import {
  formatCellValue,
  getCellAlignment,
  getCellStyles,
} from "../../utils/tableFormatters";
import { info } from "../../schema/info";
import ExportMenu from "../buttons/ExportMenu";

const AccordionTable = ({
  header = [],
  data = {},
  rows = [],
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  handleChangePage,
  handleChangeRowsPerPage,
  isFetching = false,
  isLoading = false,
  isPrintMode = false,
  printStyles = {},
  // New accordion props
  expandableConfig = null, // { keyField: 'id', detailsApi: function, detailsHeaders: [] }
  onRowExpand = null,
  expandedRows = {},
  expandableData = {},
  isLoadingExpanded = {},
  // Export props
  onExcelExport,
  onPrintExport,
  excelLabel,
  isExporting = false,
  showExportMenu = true,
  exportVariant = "outlined",
  exportSize = "medium",
}) => {
  const [localExpandedRows, setLocalExpandedRows] = useState({});
  const containerRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Use external state if provided, otherwise use local state
  const currentExpandedRows = expandableConfig
    ? expandedRows
    : localExpandedRows;
  const setExpandedRows =
    expandableConfig && onRowExpand
      ? (rowId, expanded) => onRowExpand(rowId, expanded)
      : (rowId, expanded) =>
          setLocalExpandedRows((prev) => ({ ...prev, [rowId]: expanded }));

  // Check if value is negative for styling
  const isNegativeValue = (value) => {
    return typeof value === "number" && value < 0;
  };

  // Render cell content based on formatted value
  const renderCellContent = (formattedValue, column) => {
    if (
      typeof formattedValue === "object" &&
      formattedValue.type === "status"
    ) {
      return (
        <Chip
          label={formattedValue.value}
          size="small"
          {...formattedValue.config}
        />
      );
    }
    return formattedValue;
  };

  // Handle row expansion
  const handleRowExpand = async (rowId) => {
    const isCurrentlyExpanded = currentExpandedRows[rowId];

    if (!isCurrentlyExpanded && expandableConfig?.detailsApi) {
      // Call API to fetch details if not already loaded
      try {
        await expandableConfig.detailsApi(rowId);
      } catch (error) {
        console.error("Failed to load expanded data:", error);
        return;
      }
    }

    setExpandedRows(rowId, !isCurrentlyExpanded);
  };

  // Render expanded content as a table
  const renderExpandedContent = (rowData) => {
    const keyField = expandableConfig?.keyField || "id";
    const rowKey = rowData[keyField];
    const detailsData = expandableData[rowKey] || [];
    const detailsHeaders = expandableConfig?.detailsHeaders || [];

    if (!detailsData || detailsData.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {info.noData}
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 2, backgroundColor: "background.header" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Delivery Details
        </Typography>

        <Paper elevation={1}>
          {/* Add scrollable container for the expanded table */}
          <TableContainer
            sx={{
              maxHeight: 400, // Set maximum height
              overflowY: "auto", // Enable scrolling
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {detailsHeaders.map((headerItem, index) => (
                    <TableCell
                      key={headerItem.id || index}
                      align={
                        headerItem.align || getCellAlignment(headerItem.type)
                      }
                      sx={{
                        backgroundColor: "background.paper",
                        fontWeight: "bold",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        borderBottom: "2px solid",
                        borderBottomColor: "divider",
                      }}
                    >
                      {headerItem.name || headerItem.label || headerItem.id}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {detailsData.map((detail, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    sx={{
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    {detailsHeaders.map((headerItem, colIndex) => {
                      const value = detail[headerItem.id];
                      const formattedValue = formatCellValue(value, headerItem);

                      return (
                        <TableCell
                          key={headerItem.id || colIndex}
                          align={
                            headerItem.align ||
                            getCellAlignment(headerItem.type)
                          }
                          sx={getCellStyles(headerItem.type)}
                        >
                          {value || value === 0 ? (
                            renderCellContent(formattedValue, headerItem)
                          ) : (
                            <Typography variant="body2">-</Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Summary row if needed */}
        <Box
          sx={{
            mt: 2,
            p: 1,
            backgroundColor: "background.default",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Total Records: {detailsData.length}
          </Typography>
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box className="common-table__loading">
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading data...
        </Typography>
      </Box>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <Box className="common-table__empty">
        <Typography variant="body1" color="text.secondary">
          {info.noData}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      className={`common-table ${isPrintMode ? "common-table--print" : ""}`}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...(isPrintMode ? printStyles.container : {}),
      }}
    >
      <TableContainer
        ref={tableContainerRef}
        className="common-table__container"
        sx={{
          flex: 1,
          overflow: "auto",
          minHeight: 0,
          ...(isPrintMode ? printStyles.tableContainer : {}),
        }}
      >
        <Table
          className="common-table__table"
          sx={isPrintMode ? printStyles.table : {}}
        >
          <TableHead className="common-table__head">
            <TableRow className="common-table__header-row">
              {/* Add expand column header if expandable */}
              {expandableConfig && (
                <TableCell
                  sx={{
                    width: 48,
                    padding: "8px",
                    backgroundColor: "background.header",
                    fontWeight: "bold",
                  }}
                  className="common-table__header-cell--expand"
                >
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Details
                  </Typography>
                </TableCell>
              )}

              {header.map((column, index) => (
                <TableCell
                  key={column.id || index}
                  className={`common-table__header-cell common-table__header-cell--${
                    column.id || index
                  }`}
                  align={column.align || getCellAlignment(column.type)}
                  sx={{
                    ...(isPrintMode ? printStyles.headerCell : {}),
                    backgroundColor: "background.header",
                    fontWeight: "bold",
                  }}
                  style={
                    isPrintMode && column.width ? { width: column.width } : {}
                  }
                >
                  {column.label || column.name || column.id}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className="common-table__body">
            {rows.map((row, rowIndex) => {
              const keyField = expandableConfig?.keyField || "id";
              const rowKey = row[keyField];
              const isExpanded = currentExpandedRows[rowKey];
              const hasExpandableData =
                expandableConfig &&
                expandableData[rowKey] &&
                expandableData[rowKey].length > 0;

              return (
                <React.Fragment key={rowIndex}>
                  {/* Main row */}
                  <TableRow
                    className={`common-table__row ${
                      rowIndex % 2 === 0
                        ? "common-table__row--even"
                        : "common-table__row--odd"
                    } ${isExpanded ? "common-table__row--expanded" : ""}`}
                    sx={{
                      ...(isPrintMode ? printStyles.row : {}),
                      ...(isExpanded && {
                        backgroundColor: "background.header",
                        borderLeft: "4px solid #d32f2f",
                      }),
                    }}
                  >
                    {/* Expand button column */}
                    {expandableConfig && (
                      <TableCell sx={{ width: 48, padding: "8px" }}>
                        {(() => {
                          const qtyDelivered = row.qtyDelivered || 0;
                          const hasNoDelivery = qtyDelivered === 0;
                          const tooltipText = hasNoDelivery
                            ? "No item delivered yet"
                            : "Click to see delivered items";

                          return (
                            <Tooltip title={tooltipText} placement="top" arrow>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRowExpand(rowKey)}
                                  disabled={
                                    isLoadingExpanded[rowKey] || hasNoDelivery
                                  }
                                  sx={{
                                    transition: "all 0.2s ease-in-out",
                                    transform: isExpanded
                                      ? "rotate(0deg)"
                                      : "rotate(0deg)",
                                    opacity: hasNoDelivery ? 0.5 : 1,
                                    cursor: hasNoDelivery
                                      ? "not-allowed"
                                      : "pointer",
                                    "&:hover": {
                                      backgroundColor: hasNoDelivery
                                        ? "transparent"
                                        : "action.hover",
                                    },
                                  }}
                                >
                                  {isLoadingExpanded[rowKey] ? (
                                    <CircularProgress
                                      size={16}
                                      sx={{ color: "primary.dark" }}
                                    />
                                  ) : isExpanded ? (
                                    <KeyboardArrowUp />
                                  ) : (
                                    <KeyboardArrowRight
                                      sx={{
                                        color: hasNoDelivery
                                          ? "text.disabled"
                                          : "inherit",
                                      }}
                                    />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          );
                        })()}
                      </TableCell>
                    )}

                    {/* Data columns */}
                    {header.map((column, colIndex) => {
                      const cellValue = row[column.id];
                      const formattedValue = formatCellValue(cellValue, column);
                      const isNegative = isNegativeValue(cellValue);

                      return (
                        <TableCell
                          key={column.id || colIndex}
                          className={`common-table__cell common-table__cell--${
                            column.id || colIndex
                          } ${
                            isNegative ? "common-table__cell--negative" : ""
                          }`}
                          align={column.align || getCellAlignment(column.type)}
                          sx={{
                            ...getCellStyles(column.type),
                            ...(isPrintMode ? printStyles.cell : {}),
                            ...(isNegative && isPrintMode
                              ? { color: "red" }
                              : {}),
                          }}
                        >
                          {renderCellContent(formattedValue, column)}
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  {/* Expanded content row */}
                  {expandableConfig && (
                    <TableRow>
                      <TableCell
                        colSpan={header.length + 1}
                        sx={{
                          padding: 0,
                          backgroundColor: isExpanded
                            ? "background.header"
                            : "transparent",
                        }}
                      >
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          {renderExpandedContent(row)}
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination - Hidden in print mode */}
      {!isPrintMode && handleChangePage && handleChangeRowsPerPage && (
        <Box className="common-table__bottom-actions">
          {/* Export Menu - Left side */}
          {showExportMenu && (onExcelExport || onPrintExport) && (
            <Box className="common-table__export-container">
              <ExportMenu
                onExcelExport={onExcelExport}
                onPrintExport={onPrintExport}
                excelLabel={excelLabel}
                isExporting={isExporting}
                disabled={isFetching}
                variant={exportVariant}
                size={exportSize}
              />
            </Box>
          )}

          {/* Pagination - Right side */}
          <TablePagination
            className="common-table__pagination"
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            disabled={isFetching}
            sx={{
              flexShrink: 0,
            }}
          />
        </Box>
      )}

      {/* Loading overlay for fetching */}
      {isFetching && !isPrintMode && (
        <Box className="common-table__fetching-overlay">
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default AccordionTable;

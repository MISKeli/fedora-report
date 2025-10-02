// CommonTable.js - Refactored with integrated ExportMenu
import React, { useEffect, useRef } from "react";
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
} from "@mui/material";
import ExportMenu from "../buttons/ExportMenu";
import "../tables/scss/CommonTable.scss";
import {
  formatCellValue,
  getCellAlignment,
  getCellStyles,
} from "../../utils/tableFormatters";

const CommonTable = ({
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
  // Export props
  onExcelExport,
  onPrintExport,
  excelLabel,
  isExporting = false,
  showExportMenu = true,
  exportVariant = "outlined",
  exportSize = "medium",
}) => {
  const containerRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Check if value is negative for styling
  const isNegativeValue = (value) => {
    return typeof value === "number" && value < 0;
  };

  // Render cell content based on formatted value
  const renderCellContent = (formattedValue, column) => {
    // Handle status type that returns object
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

    // Return formatted string value
    return formattedValue;
  };

  // Get cell alignment - use column.align if specified, otherwise use formatter function
  const getCellAlignmentForColumn = (column) => {
    if (column.align) return column.align;
    return getCellAlignment(column.type);
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
          No data available
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
              {header.map((column, index) => (
                <TableCell
                  key={column.id || index}
                  className={`common-table__header-cell common-table__header-cell--${
                    column.id || index
                  }`}
                  align={getCellAlignmentForColumn(column)}
                  sx={isPrintMode ? printStyles.headerCell : {}}
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
            {rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={`common-table__row ${
                  rowIndex % 2 === 0
                    ? "common-table__row--even"
                    : "common-table__row--odd"
                }`}
                sx={isPrintMode ? printStyles.row : {}}
              >
                {header.map((column, colIndex) => {
                  const cellValue = row[column.id];
                  const formattedValue = formatCellValue(cellValue, column);
                  const isNegative = isNegativeValue(cellValue);
                  const cellStyles = getCellStyles(column.type);

                  return (
                    <TableCell
                      key={column.id || colIndex}
                      className={`common-table__cell common-table__cell--${
                        column.id || colIndex
                      } ${isNegative ? "common-table__cell--negative" : ""}`}
                      align={getCellAlignmentForColumn(column)}
                      sx={{
                        ...cellStyles,
                        ...(isPrintMode ? printStyles.cell : {}),
                        ...(isNegative && isPrintMode ? { color: "red" } : {}),
                      }}
                    >
                      {renderCellContent(formattedValue, column)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bottom Actions Bar - Hidden in print mode */}
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

export default CommonTable;

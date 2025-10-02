import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Paper,
  Chip,
} from "@mui/material";
import React from "react";
import { info } from "../../schema/info";
import {
  formatCellValue,
  getCellAlignment,
  getCellStyles,
} from "../../utils/tableFormatters";

const MoveOrderTable = ({
  header,
  data,
  rows,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  isFetching,
  isLoading,
  totalCount,
  // Add new prop to identify move order table
  isMoveOrderTable = true,
}) => {
  // Function to render cell content based on type
  const renderCellContent = (value, column, rowIndex) => {
    // Handle Line column (first column) - auto generate line numbers
    if (column.id === "" && column.name === "Line") {
      return rowIndex + 1;
    }

    // Handle UOM column - use static value from info
    if (column.id === "uom") {
      return info.moveOrder.uom; // "BAG"
    }

    // Handle Qty Actual Received column - leave blank for move order
    if (column.name === "Qty Actual Received" && isMoveOrderTable) {
      return ""; // Empty cell
    }

    const formattedValue = formatCellValue(value, column);

    // Handle status chips
    if (
      formattedValue &&
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

    // Handle regular formatted values
    return formattedValue;
  };

  // Calculate total quantity for move order
  const calculateTotal = () => {
    if (!isMoveOrderTable || !rows?.length) return 0;
    return rows.reduce((sum, row) => sum + (row.quantity || 0), 0);
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          flex: 1,
          overflow: "auto",
         
          height: "100%",
          //maxHeight: "100%",
          // Move order specific styling
          ...(isMoveOrderTable && {
            border: "2px solid #000",
            borderRadius: 0,
            boxShadow: "none",
          }),
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {header?.map((column, index) => (
                <TableCell
                  key={`${column.id}-${index}`}
                  align={getCellAlignment(column.type)}
                  sx={{
                    // Move order specific header styling
                    ...(isMoveOrderTable && {
                      border: "1px solid #000",
                      backgroundColor: "white",
                      fontWeight: "bold",
                      fontSize: "11px",
                      padding: "8px 6px",
                      textAlign: "center",
                      verticalAlign: "middle",
                      lineHeight: 1.2,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }),
                  }}
                >
                  {column.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching || isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  {header.map((col, colIndex) => (
                    <TableCell
                      key={`${col.id}-${colIndex}`}
                      align={getCellAlignment(col.type)}
                      sx={{
                        ...(isMoveOrderTable && {
                          border: "1px solid #000",
                          fontSize: "11px",
                          padding: "8px 6px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }),
                      }}
                    >
                      <Skeleton variant="text" animation="wave" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows?.length > 0 ? (
              rows?.map((row, index) => (
                <TableRow key={index}>
                  {header.map((col, colIndex) => (
                    <TableCell
                      key={`${col.id}-${colIndex}`}
                      data-type={col.type || "text"}
                      align={getCellAlignment(col.type)}
                      className={
                        col.id === "" && col.name === "Line"
                          ? "line-number-cell"
                          : col.id === "uom"
                          ? "uom-cell"
                          : col.name === "Qty Actual Received"
                          ? "qty-received-cell"
                          : ""
                      }
                      sx={{
                        ...getCellStyles(col.type),
                        // Move order specific cell styling
                        ...(isMoveOrderTable && {
                          border: "1px solid #000",
                          fontSize: "11px",
                          padding: "8px 6px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          // Left align for description column (3rd column)
                          ...(colIndex === 2 &&
                            col.type === "text" && {
                              textAlign: "left",
                            }),
                          // Special styling for qty received column
                          ...(col.name === "Qty Actual Received" && {
                            backgroundColor: "#fafafa",
                          }),
                        }),
                      }}
                    >
                      {renderCellContent(row[col.id], col, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={header.length}
                  align="center"
                  sx={{
                    py: 4,
                    height: "200px",
                    verticalAlign: "middle",
                    ...(isMoveOrderTable && {
                      border: "1px solid #000",
                      fontSize: "11px",
                    }),
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    {info.noData}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Hide pagination for move order table */}
      {!isMoveOrderTable && (
        <TablePagination
          component="div"
          count={totalCount || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
          showFirstButton
          showLastButton
          sx={{
            flexShrink: 0,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        />
      )}

      {/* Add total calculation for move order - this can be used by parent component */}
      {isMoveOrderTable && (
        <Box sx={{ display: "none" }} data-total={calculateTotal()} />
      )}
    </Box>
  );
};

export default MoveOrderTable;

import React, { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
  Alert,
  Chip,
} from "@mui/material";
import { Close as CloseIcon, Print as PrintIcon } from "@mui/icons-material";
import { toast } from "sonner";
import CommonTable from "../tables/CommonTable";
import { getCellAlignment } from "../../utils/tableFormatters";
import "../dialogs/scss/PrintPreviewDialog.scss";

/**
 * Utility functions
 */
const generateFilename = ({ moduleName, startDate, endDate, searchFilter }) => {
  const currentDate = new Date().toISOString().split("T")[0];
  let filename = moduleName || "Report";

  if (startDate && endDate) {
    filename += `-${startDate}_to_${endDate}`;
  } else {
    filename += `-${currentDate}`;
  }

  if (searchFilter?.trim()) {
    const sanitizedFilter = searchFilter.trim().replace(/\s+/g, "_");
    filename += `-filtered_by_${sanitizedFilter}`;
  }

  return filename;
};

// Generate column-specific alignment styles based on headers
const generateColumnAlignmentStyles = (headers) => {
  return headers.map((column, index) => {
    const alignment = column.align || getCellAlignment(column.type);
    const headerClass = `common-table__header-cell--${column.id || index}`;
    const cellClass = `common-table__cell--${column.id || index}`;
    
    return `
      .print-table-wrapper .${headerClass} {
        text-align: ${alignment} !important;
      }
      .print-table-wrapper .${cellClass} {
        text-align: ${alignment} !important;
      }
    `;
  }).join('');
};

const PRINT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.4;
    color: #1a202c;
    background: white;
  }
  
  .print-container {
    max-width: 100%;
    margin: 0;
    padding: 20px;
  }
  
  .print-header {
    text-align: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #2d3748;
  }
  
  .print-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1a202c;
  }
  
  .print-company {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 6px;
    color: #2d3748;
  }
  
  .print-subtitle {
    font-size: 14px;
    color: #4a5568;
    margin-bottom: 4px;
  }
  
  .print-date {
    font-size: 12px;
    color: #718096;
  }
  
  .print-table-wrapper {
    width: 100%;
    overflow: visible;
    margin: 16px 0;
  }
  
  .print-table-wrapper .common-table__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    table-layout: fixed;
  }
  
  .print-table-wrapper .common-table__header-cell {
    border: 1px solid #000 !important;
    background-color: #f5f5f5 !important;
    font-weight: 600 !important;
    font-size: 10px !important;
    padding: 6px 4px !important;
    word-wrap: break-word !important;
  }
  
  .print-table-wrapper .common-table__cell {
    border: 1px solid #000 !important;
    font-size: 10px !important;
    padding: 4px 3px !important;
    word-wrap: break-word !important;
    overflow: hidden !important;
  }
  
  .print-table-wrapper .common-table__row {
    page-break-inside: avoid;
  }
  
  .print-table-wrapper .common-table__cell--negative {
   // color: #d32f2f !important;
  }
  
  .print-summary {
    margin-top: 20px;
    padding: 16px;
    background-color: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }
  
  .print-summary-total {
    font-weight: 600;
    color: #2d3748;
  }
  
  .print-summary-filter {
    color: #4a5568;
  }
  
  @media print {
    @page {
      //size: A4;
      margin: 15mm 10mm;
    }
    
    body { 
      margin: 0; 
      font-size: 8px;
    }
    
    .print-container { 
      margin: 0; 
      padding: 10px; 
    }
    
    .print-header {
      margin-bottom: 15px;
      padding-bottom: 10px;
    }
    
    .print-title {
      font-size: 18px;
      margin-bottom: 4px;
    }
    
    .print-company {
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .print-subtitle {
      font-size: 11px;
      margin-bottom: 2px;
    }
    
    .print-date {
      font-size: 10px;
    }
    
    .print-table-wrapper .common-table__table {
      font-size: 8px !important;
    }
    
    .print-table-wrapper .common-table__header-cell {
      font-size: 7px !important;
      padding: 2px 1px !important;
    }
    
    .print-table-wrapper .common-table__cell {
      font-size: 7px !important;
      padding: 2px 1px !important;
    }
    
    .print-summary {
      margin-top: 10px;
      padding: 8px;
      font-size: 9px;
    }
  }
`;

/**
 * Print Preview Dialog Component
 */
const PrintPreviewDialog = ({
  isOpen = false,
  onClose,
  data = [],
  headers = [],
  moduleName = "",
  companyName = "RDF, Feed, Livestock and Foods Inc.",
  startDate = "",
  endDate = "",
  searchFilter = "",
  customTitle = "",
  isLoading = false,
  totals = null, // For displaying totals if needed
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef(null);

  const filename = generateFilename({
    moduleName,
    startDate,
    endDate,
    searchFilter,
  });

  // Print styles for CommonTable
  const printTableStyles = {
    container: {
      width: "100%",
      overflow: "visible",
    },
    tableContainer: {
      width: "100%",
      overflow: "visible",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "11px",
      tableLayout: "fixed",
    },
    headerCell: {
      border: "1px solid #000",
      backgroundColor: "#f5f5f5",
      fontWeight: 600,
      fontSize: "10px",
      padding: "6px 4px",
      textAlign: "center",
      wordWrap: "break-word",
    },
    cell: {
      border: "1px solid #000",
      fontSize: "10px",
      padding: "4px 3px",
      wordWrap: "break-word",
      overflow: "hidden",
    },
    row: {
      pageBreakInside: "avoid",
    },
  };

  const handlePrint = useCallback(async () => {
    if (!printRef.current) return;

    setIsPrinting(true);

    try {
      // Create hidden iframe for printing
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "position:absolute;top:-1000px;left:-1000px;width:0;height:0;border:none;";
      document.body.appendChild(iframe);

      const printTitle = customTitle || moduleName || "Report";
      const dateRange =
        startDate && endDate
          ? `Period: ${startDate} to ${endDate}`
          : `Date: ${new Date().toLocaleDateString()}`;
      const filterInfo = searchFilter ? `Filtered by: ${searchFilter}` : "";
      const generatedDate = `Generated on: ${new Date().toLocaleString()}`;

      // Generate column-specific alignment styles
      const columnAlignmentStyles = generateColumnAlignmentStyles(headers);

      const printDocument = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${filename}</title>
            <meta charset="utf-8">
            <style>
              ${PRINT_STYLES}
              ${columnAlignmentStyles}
            </style>
          </head>
          <body>
            <div class="print-container">
              <div class="print-header">
                <div class="print-title">${printTitle}</div>
                <div class="print-company">${companyName}</div>
                <div class="print-subtitle">${dateRange}</div>
                ${
                  filterInfo
                    ? `<div class="print-subtitle">${filterInfo}</div>`
                    : ""
                }
                <div class="print-date">${generatedDate}</div>
              </div>
              <div class="print-table-wrapper">
                ${printRef.current.innerHTML}
              </div>
              ${
                searchFilter
                  ? `<div class="print-summary"><span class="print-summary-filter">Filtered by: ${searchFilter}</span></div>`
                  : ""
              }
            </div>
          </body>
        </html>
      `;

      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        } catch (error) {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          throw error;
        }
      };

      const printWindow = iframe.contentWindow;
      printWindow.document.open();
      printWindow.document.write(printDocument);
      printWindow.document.close();
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print document. Please try again.", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsPrinting(false);
    }
  }, [
    data,
    headers,
    filename,
    customTitle,
    moduleName,
    companyName,
    startDate,
    endDate,
    searchFilter,
  ]);

  const handleClose = useCallback(() => {
    if (!isPrinting && onClose) {
      onClose();
    }
  }, [isPrinting, onClose]);

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      className="print-preview-dialog"
      sx={{
        "& .MuiDialog-paper": {
          height: "90vh",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <Box className="print-preview-dialog__header">
        <Box className="print-preview-dialog__header-content">
          <Typography variant="h6" className="print-preview-dialog__title">
            Print Preview
          </Typography>
          <Typography
            variant="body2"
            className="print-preview-dialog__subtitle"
          >
            {filename}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isPrinting}
          className="print-preview-dialog__close-btn"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Content */}
      <DialogContent className="print-preview-dialog__content">
        {/* Print Header Preview */}
        <Box className="print-preview-dialog__print-header">
          <Typography
            variant="h4"
            className="print-preview-dialog__print-title"
          >
            {customTitle || moduleName || "Report"}
          </Typography>

          <Typography
            variant="h6"
            className="print-preview-dialog__print-company"
          >
            {companyName}
          </Typography>

          <Typography
            variant="body1"
            className="print-preview-dialog__print-period"
          >
            {startDate && endDate
              ? `Period: ${startDate} to ${endDate}`
              : `Date: ${new Date().toLocaleDateString()}`}
          </Typography>

          {searchFilter && (
            <Typography
              variant="body2"
              className="print-preview-dialog__print-filter"
            >
              Filtered by: {searchFilter}
            </Typography>
          )}

          <Typography
            variant="caption"
            className="print-preview-dialog__print-generated"
          >
            Generated on: {new Date().toLocaleString()}
          </Typography>
        </Box>

        {/* Table Content */}
        <Box ref={printRef} className="print-preview-dialog__table-container">
          {isLoading ? (
            <Box className="print-preview-dialog__loading">
              <Typography>Loading data...</Typography>
            </Box>
          ) : !data || data.length === 0 ? (
            <Box className="print-preview-dialog__no-data">
              <Alert severity="info">No data available to print</Alert>
            </Box>
          ) : (
            <CommonTable
              header={headers}
              data={{ items: data }}
              rows={data}
              isFetching={false}
              isLoading={false}
              isPrintMode={false}
            />
          )}
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions className="print-preview-dialog__actions">
        <Button onClick={handleClose} disabled={isPrinting}>
          Cancel
        </Button>
        <Button
          onClick={handlePrint}
          disabled={isPrinting || isLoading || !data || data.length === 0}
          variant="contained"
          startIcon={<PrintIcon />}
        >
          {isPrinting ? "Printing..." : "Print"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Custom hook for managing print data
 */
const usePrintData = () => {
  const [isPrintLoading, setIsPrintLoading] = useState(false);
  const [printData, setPrintData] = useState([]);

  const fetchPrintData = useCallback(async (apiQuery, queryParams) => {
    setIsPrintLoading(true);

    try {
      const result = await apiQuery({
        ...queryParams,
        usePagination: false, // Always fetch all data for printing
      }).unwrap();

      const items = result?.items || result || [];
      setPrintData(items);
      return items;
    } catch (error) {
      console.error("Failed to fetch print data:", error);
      toast.error("Failed to load print data", {
        duration: 4000,
        position: "top-right",
      });
      setPrintData([]);
      throw error;
    } finally {
      setIsPrintLoading(false);
    }
  }, []);

  const clearPrintData = useCallback(() => {
    setPrintData([]);
  }, []);

  return {
    printData,
    isPrintLoading,
    fetchPrintData,
    clearPrintData,
    setPrintData,
  };
};

export { PrintPreviewDialog, usePrintData };
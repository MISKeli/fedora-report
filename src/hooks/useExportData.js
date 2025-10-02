import { Workbook } from "exceljs";
import { useCallback } from "react";
import { toast } from "sonner";
import { info } from "../schema/info";
import dayjs from "dayjs";
import { formatCellValue } from "../utils/tableFormatters";

const useExportData = () => {
  const exportToExcel = useCallback(
    async ({
      moduleKey, // e.g., 'FGInventory', 'orderSummary' - the key in info object
      exportData = null,
      reportData = null,
      apiKey,
      apiQuery,
      searchParams = {},
    }) => {
      try {
        // Get module info using the key
        const moduleInfo = info[moduleKey];
        if (!moduleInfo) {
          throw new Error(`Module info not found for: ${moduleKey}`);
        }

        const { title, tableHeader } = moduleInfo;

        let allData = exportData;

        // If no export data provided or incomplete, fetch all data
        if (!allData || allData.length === 0) {
          toast.info("Fetching all data for export...");

          // Prepare query parameters for fetching all data
          const queryParams = {
            apiKey,
            usePagination: false, // Get all data
            ...searchParams,
            ...(reportData && reportData), // Include date range if available
          };
      

          // Use the provided RTK query to fetch all data
          const result = await apiQuery(queryParams).unwrap();
      
          allData = result.items || result || [];
        }

        if (!allData || allData.length === 0) {
          throw new Error("No data available to export.");
        }

        // Create workbook
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet(title);

        // Extract headers from tableHeader
        const headers = tableHeader.map((header) => header.name);

        // Add headers
        const headerRow = worksheet.addRow(headers);

        // Style headers
        headerRow.eachCell((cell, colNumber) => {
          cell.font = {
            color: { argb: "FFFFFF" },
            bold: true,
            size: 12,
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "772626" }, // Primary Color
          };
          cell.border = {
            top: { style: "thin", color: { argb: "000000" } },
            bottom: { style: "thin", color: { argb: "000000" } },
            left: { style: "thin", color: { argb: "000000" } },
            right: { style: "thin", color: { argb: "000000" } },
          };
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };

          // Set column width based on header length
          const headerText = headers[colNumber - 1];
          worksheet.getColumn(colNumber).width = Math.max(
            12,
            headerText.length + 3
          );
        });

        // Process and add data rows
        allData.forEach((item, rowIndex) => {
          const rowData = tableHeader.map((header) => {
            const value = item[header.id];

            // Use your existing formatter but return raw value for Excel
            const formattedValue = formatCellValue(value, header);

            // Handle status type differently for Excel (just return the text)
            if (
              header.type === "status" &&
              typeof formattedValue === "object"
            ) {
              return formattedValue.value || value || "";
            }

            // For other types, return the formatted value or original value
            return formattedValue || value || "";
          });

          const dataRow = worksheet.addRow(rowData);

          // Apply formatting based on data types using your column types
          dataRow.eachCell((cell, colNumber) => {
            const columnConfig = tableHeader[colNumber - 1];
            const cellValue = cell.value;

            // Apply number formatting for numeric types
            if (
              ["number", "decimal", "currency", "percentage"].includes(
                columnConfig.type
              )
            ) {
              if (typeof cellValue === "number") {
                switch (columnConfig.type) {
                  case "currency":
                    cell.numFmt = '"$"#,##0.00';
                    break;
                  case "percentage":
                    cell.numFmt = "0.00%";
                    break;
                  case "number":
                  case "decimal":
                  default:
                    cell.numFmt = "#,##0.00";
                    break;
                }

                // Highlight negative values in red
                if (cellValue < 0) {
                  cell.font = { color: { argb: "DC3545" } }; // Red color
                }
              }
              cell.alignment = { horizontal: "right" };
            } else if (columnConfig.type === "date") {
              cell.alignment = { horizontal: "center" };
              if (cellValue && cellValue !== "-") {
                cell.numFmt = "mm/dd/yyyy";
              }
            } else if (columnConfig.type === "datetime") {
              cell.alignment = { horizontal: "center" };
              if (cellValue && cellValue !== "-") {
                cell.numFmt = "mm/dd/yyyy h:mm AM/PM";
              }
            } else if (columnConfig.type === "status") {
              cell.alignment = { horizontal: "center" };

              // Color code based on status
              const statusValue = cellValue
                ? cellValue.toString().toLowerCase()
                : "";
              if (
                [
                  "complete",
                  "done",
                  "finished",
                  "success",
                  "approved",
                ].includes(statusValue)
              ) {
                cell.font = { color: { argb: "198754" }, bold: true }; // Green
              } else if (
                ["pending", "waiting", "queued"].includes(statusValue)
              ) {
                cell.font = { color: { argb: "FFC107" }, bold: true }; // Yellow
              } else if (
                ["failed", "error", "rejected", "cancelled"].includes(
                  statusValue
                )
              ) {
                cell.font = { color: { argb: "DC3545" }, bold: true }; // Red
              } else if (
                ["ongoing", "in-progress", "processing", "active"].includes(
                  statusValue
                )
              ) {
                cell.font = { color: { argb: "0DCAF0" }, bold: true }; // Blue
              }
            } else if (columnConfig.type === "boolean") {
              cell.alignment = { horizontal: "center" };
            } else {
              // Text alignment for other types
              cell.alignment = { horizontal: "left" };
            }

            // Add borders to all cells
            cell.border = {
              top: { style: "thin", color: { argb: "E0E0E0" } },
              bottom: { style: "thin", color: { argb: "E0E0E0" } },
              left: { style: "thin", color: { argb: "E0E0E0" } },
              right: { style: "thin", color: { argb: "E0E0E0" } },
            };

            // Alternate row colors
            if (rowIndex % 2 === 1) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "F8F9FA" }, // Light gray
              };
            }
          });
        });

        // Auto-fit columns based on content
        worksheet.columns.forEach((column, index) => {
          let maxWidth = headers[index]?.length || 10;

          // Check a sample of rows for content width
          const sampleSize = Math.min(allData.length, 20);
          for (let i = 0; i < sampleSize; i++) {
            const cellValue = worksheet.getRow(i + 2).getCell(index + 1).value;
            if (cellValue) {
              const cellLength = cellValue.toString().length;
              maxWidth = Math.max(maxWidth, cellLength);
            }
          }

          column.width = Math.min(Math.max(maxWidth + 2, 20), 50); // Min 10, max 50
        });

        // Generate filename with proper date formatting
        let fileName = `${title} Report`;

        if (reportData && (reportData.startDate || reportData.endDate)) {
          // Use report date range if available
          const startDate = reportData.startDate
            ? dayjs(reportData.startDate).format("MM/DD/YYYY")
            : "";
          const endDate = reportData.endDate
            ? dayjs(reportData.endDate).format("MM/DD/YYYY")
            : "";

          if (startDate && endDate) {
            fileName += ` - ${startDate} to ${endDate}`;
          } else if (startDate) {
            fileName += ` - ${startDate}`;
          } else if (endDate) {
            fileName += ` - ${endDate}`;
          }
        } else {
          // Use current date as fallback
          const currentDate = dayjs().format("MM/DD/YYYY");
          fileName += ` - ${currentDate}`;
        }

        // Add search filter to filename if present
        const searchValue =
          searchParams.itemCode ||
          searchParams.search ||
          searchParams.itemCodeSearch;
        if (searchValue && searchValue.trim()) {
          fileName += ` - filtered by ${searchValue.trim()}`;
        }

        fileName += ".xlsx";

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(`${title} exported successfully!`);

        return { success: true, fileName, recordCount: allData.length };
      } catch (error) {
       
        toast.error(`Export failed: ${error.message}`);
        return { success: false, error: error.message };
      }
    },
    []
  );

  return {
    exportToExcel,
  };
};

export default useExportData;

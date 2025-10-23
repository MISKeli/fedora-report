import React, { useCallback, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import PageHeader from "../headers/PageHeader";
import DateSearch from "../headers/DateSearch";
import AccordionTable from "../tables/AccordionTable";
import CommonTable from "../tables/CommonTable";
import useExportData from "../../hooks/useExportData";
import {
  PrintPreviewDialog,
  usePrintData,
} from "../dialogs/PrintPreviewDialog";
import { info } from "../../schema/info";

/**
 * Dynamic Report Page Component
 *
 * @param {Object} config - Configuration object for the report
 * @param {string} config.moduleKey - Key from info object (e.g., 'orderSummary')
 * @param {Function} config.useQuery - RTK Query hook for fetching data
 * @param {Function} config.useLazyQuery - RTK Query lazy hook for export/print
 * @param {Function} config.useDetailsQuery - Optional lazy hook for expandable details
 * @param {Object} config.tableConfig - Table configuration
 * @param {boolean} config.tableConfig.isAccordion - Whether to use AccordionTable or CommonTable
 * @param {string} config.tableConfig.keyField - Primary key field for accordion
 * @param {string} config.tableConfig.quantityField - Quantity field for accordion
 * @param {Array} config.tableConfig.detailsHeaders - Headers for expandable details
 * @param {Object} config.searchConfig - Search configuration
 * @param {string} config.searchConfig.placeholder - Search placeholder text
 * @param {boolean} config.searchConfig.hasDatePicker - Whether to show date picker
 * @param {boolean} config.searchConfig.updateQueryParams - Whether to update URL params
 * @param {string} config.searchConfig.searchType - Search type: "text", "number", or "both"
 * @param {Object} config.exportConfig - Export configuration
 * @param {boolean} config.exportConfig.showExcelExport - Show Excel export
 * @param {boolean} config.exportConfig.showPrintExport - Show Print export
 * @param {string} config.exportConfig.excelLabel - Label for Excel button
 * @param {string} config.exportConfig.variant - Button variant
 * @param {string} config.exportConfig.size - Button size
 * @param {string} config.customClassName - Custom CSS class for styling
 */
const DynamicReportPage = ({ config }) => {
  const {
    moduleKey,
    useQuery,
    useLazyQuery,
    useDetailsQuery,
    tableConfig = {},
    searchConfig = {},
    exportConfig = {},
    customClassName = "report",
  } = config;

  const apiKey = useSelector((state) => state.auth.apiKey);
  const { exportToExcel } = useExportData();

  // Get module info
  const moduleInfo = info[moduleKey] || {};
  const header = moduleInfo.tableHeader || [];
  const detailsHeaders =
    tableConfig.detailsHeaders !== undefined
      ? tableConfig.detailsHeaders
      : moduleInfo.served || [];

  // State management
  const [searchValue, setSearchValue] = useState("");
  const [reportData, setReportData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Accordion state (only used if isAccordion is true)
  const [expandedRows, setExpandedRows] = useState({});
  const [expandableData, setExpandableData] = useState({});
  const [isLoadingExpanded, setIsLoadingExpanded] = useState({});

  // Print state
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const { printData, isPrintLoading, fetchPrintData } = usePrintData();

  // Query hooks
  const [triggerLazyQuery] = useLazyQuery();
  const triggerDetailsQuery = useDetailsQuery ? useDetailsQuery()[0] : null;

  // Determine if hasDatePicker is enabled (defaults to true if not specified)
  const hasDatePicker = searchConfig.hasDatePicker !== false;

  // Main data query
  // Only skip if date picker is ENABLED but dates are missing
  // If date picker is disabled, never skip the query
  const shouldSkipQuery =
    hasDatePicker &&
    (!reportData || !reportData.startDate || !reportData.endDate);

  const searchParamName = searchConfig.searchParamName || "search";
  const queryParams = {
    apiKey: apiKey,
    usePagination: true,
    [searchParamName]: searchValue,
    pageNumber: page + 1,
    pageSize: rowsPerPage,
    // Only spread reportData if it exists and has values
    ...(reportData && Object.keys(reportData).length > 0 ? reportData : {}),
  };

  const {
    data: queryData,
    isLoading: isDataLoading,
    isFetching: isDataFetching,
  } = useQuery(queryParams, {
    skip: shouldSkipQuery,
  });

  const rows = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;

  // Reset to first page when search changes
  useEffect(() => {
    setPage(0);
  }, [searchValue, reportData]);

  // Event handlers
  const handleSearchChange = useCallback((searchValue) => {
    setSearchValue(searchValue);
  }, []);

  const handleReportDataChange = useCallback(async (data) => {
    setReportData(data);
  }, []);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  // Row expansion handler (for accordion tables)
  const handleRowExpand = useCallback(
    async (rowId, isExpanding) => {
      if (!tableConfig.isAccordion || !triggerDetailsQuery) return;

      if (isExpanding && !expandableData[rowId]) {
        setIsLoadingExpanded((prev) => ({ ...prev, [rowId]: true }));

        try {
          const result = await triggerDetailsQuery({
            apiKey: apiKey,
            id: rowId.toString(),
          }).unwrap();

          setExpandableData((prev) => ({
            ...prev,
            [rowId]: result || [],
          }));
        } catch (error) {
          toast.error("Failed to load details");
          return;
        } finally {
          setIsLoadingExpanded((prev) => ({ ...prev, [rowId]: false }));
        }
      }

      setExpandedRows((prev) => ({
        ...prev,
        [rowId]: isExpanding,
      }));
    },
    [apiKey, triggerDetailsQuery, expandableData, tableConfig.isAccordion]
  );

  // Export handlers
  const handleExcelExport = useCallback(async () => {
    if (shouldSkipQuery) {
      toast.error("Please select a date range before exporting.");
      return;
    }

    setIsExporting(true);

    try {
      await exportToExcel({
        moduleKey: moduleKey,
        exportData: null,
        reportData: reportData,
        apiKey: apiKey,
        apiQuery: triggerLazyQuery,
        searchParams: {
          search: searchValue,
        },
      });
    } catch (error) {
      console.error("Excel export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [
    shouldSkipQuery,
    exportToExcel,
    reportData,
    apiKey,
    triggerLazyQuery,
    searchValue,
    moduleKey,
  ]);

  const handlePrintExport = useCallback(async () => {
    try {
      setShowPrintPreview(true);

      await fetchPrintData(triggerLazyQuery, {
        apiKey: apiKey,
        usePagination: false,
        search: searchValue,
        ...reportData,
      });
    } catch (error) {
      setShowPrintPreview(false);
    }
  }, [fetchPrintData, triggerLazyQuery, apiKey, searchValue, reportData]);

  const handlePrintPreviewClose = useCallback(() => {
    setShowPrintPreview(false);
  }, []);

  // Print filename props
  const getPrintFilenameProps = () => {
    return {
      moduleName: moduleInfo.title,
      companyName: info.companyName,
      startDate: reportData?.startDate,
      endDate: reportData?.endDate,
      searchFilter: searchValue,
      customTitle: `${moduleInfo.title} Report`,
    };
  };

  // Accordion configuration
  const accordionConfig = tableConfig.isAccordion
    ? {
        keyField: tableConfig.keyField || "id",
        detailsApi: handleRowExpand,
        detailsHeaders: detailsHeaders,
        quantityField: tableConfig.quantityField,
      }
    : null;

  // Table props
  const commonTableProps = {
    header,
    data: queryData,
    rows,
    page,
    rowsPerPage,
    totalCount,
    handleChangePage,
    handleChangeRowsPerPage,
    isFetching: isDataFetching,
    isLoading: isDataLoading,
  };

  const exportProps =
    exportConfig.showExcelExport || exportConfig.showPrintExport
      ? {
          onExcelExport: exportConfig.showExcelExport
            ? handleExcelExport
            : undefined,
          onPrintExport: exportConfig.showPrintExport
            ? handlePrintExport
            : undefined,
          excelLabel: exportConfig.excelLabel || "Download Report",
          isExporting,
          showExportMenu: true,
          exportVariant: exportConfig.variant || "outlined",
          exportSize: exportConfig.size || "medium",
        }
      : {};

  return (
    <Box className={customClassName}>
      <Box className={`${customClassName}__header`}>
        <Box className={`${customClassName}__header__content`}>
          <PageHeader title={moduleInfo.title} />
          <DateSearch
            searchPlaceHolder={
              searchConfig.placeholder || moduleInfo.placeHolader
            }
            onSearchChange={handleSearchChange}
            searchValue={searchValue}
            setReportData={handleReportDataChange}
            updateQueryParams={searchConfig.updateQueryParams !== false}
            hasDatePicker={hasDatePicker}
            searchType={searchConfig.searchType || "text"}
          />
        </Box>
      </Box>

      <Box className={`${customClassName}__body`}>
        {tableConfig.isAccordion ? (
          <AccordionTable
            {...commonTableProps}
            expandableConfig={accordionConfig}
            onRowExpand={handleRowExpand}
            expandedRows={expandedRows}
            expandableData={expandableData}
            isLoadingExpanded={isLoadingExpanded}
            {...exportProps}
          />
        ) : (
          <CommonTable {...commonTableProps} {...exportProps} />
        )}
      </Box>

      {/* Print Preview Dialog */}
      {showPrintPreview && (
        <PrintPreviewDialog
          isOpen={showPrintPreview}
          onClose={handlePrintPreviewClose}
          data={printData}
          headers={header}
          isLoading={isPrintLoading}
          {...getPrintFilenameProps()}
        />
      )}
    </Box>
  );
};

export default DynamicReportPage;

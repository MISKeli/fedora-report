import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
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
import useDebounce from "../../hooks/useDebounce";

/**
 * Dynamic Report Page Component
 *
 * @param {Object} config
 * @param {string} config.moduleKey
 * @param {Function} config.useQuery
 * @param {Function} config.useLazyQuery
 * @param {Function} config.useDetailsQuery
 * @param {Object} config.tableConfig
 * @param {boolean} config.tableConfig.isAccordion
 * @param {string}  config.tableConfig.keyField
 * @param {string}  config.tableConfig.quantityField  - field used for disabling expand (0 → disabled)
 * @param {Array}   config.tableConfig.detailsHeaders
 * @param {string}  config.tableConfig.clickableField - field id in details rows that is clickable
 * @param {Function} config.tableConfig.onDetailCellClick - (detailRow, parentRow) => void
 * @param {Object} config.searchConfig
 * @param {Object} config.exportConfig
 * @param {string} config.customClassName
 */
const DynamicReportPage = ({ config }) => {
  const {
    moduleKey,
    useQuery,
    useLazyQuery,
    useDetailsQuery,
    extraParams = {}, // ← ADD
    skipQuery = false,
    tableConfig = {},
    searchConfig = {},

    exportConfig = {},

    customClassName = "report",
  } = config;

  const apiKey = useSelector((state) => state.auth.apiKey);
  const { exportToExcel } = useExportData();

  const moduleInfo = info[moduleKey] || {};
  const header = moduleInfo.tableHeader || [];
  const detailsHeaders =
    tableConfig.detailsHeaders !== undefined
      ? tableConfig.detailsHeaders
      : moduleInfo.served || [];

  // State
  const [searchValue, setSearchValue] = useState("");
  const [reportData, setReportData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const debouncedSearch = useDebounce(searchValue, 500);

  // Accordion state
  const [expandedRows, setExpandedRows] = useState({});
  const [expandableData, setExpandableData] = useState({});
  const [isLoadingExpanded, setIsLoadingExpanded] = useState({});

  // Print state
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const { printData, isPrintLoading, fetchPrintData } = usePrintData();

  const [triggerLazyQuery] = useLazyQuery();
  const detailsQueryResult = useDetailsQuery?.() ?? [null];
  const triggerDetailsQuery = detailsQueryResult[0];

  const hasDatePicker = searchConfig.hasDatePicker !== false;
  const shouldSkipQuery =
    skipQuery || // ← ADD this line
    (hasDatePicker &&
      (!reportData || !reportData.startDate || !reportData.endDate));

  const searchParamName = searchConfig.searchParamName || "search";
  const queryParams = {
    apiKey,
    usePagination: true,
    [searchParamName]: debouncedSearch,
    pageNumber: page + 1,
    pageSize: rowsPerPage,
    ...extraParams,
    ...(reportData && Object.keys(reportData).length > 0 ? reportData : {}),
  };

  const {
    data: queryData,
    isLoading: isDataLoading,
    isFetching: isDataFetching,
  } = useQuery(queryParams, { skip: shouldSkipQuery });

  const rows = queryData?.items || [];
  const totalCount = queryData?.totalCount || 0;

  useEffect(() => {
    setPage(0);
  }, [searchValue, reportData]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback((val) => setSearchValue(val), []);

  const handleReportDataChange = useCallback(async (data) => {
    setReportData(data);
  }, []);

  const handleChangePage = useCallback((_, newPage) => setPage(newPage), []);

  const handleChangeRowsPerPage = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  /**
   * handleRowExpand - called by AccordionTable with (rowId, isExpanding, rowData)
   *
   * rowData is the full parent row object — used to pass item_code (or any
   * other field) to the details API.
   */
  const handleRowExpand = useCallback(
    async (rowId, isExpanding, rowData) => {
      if (!tableConfig.isAccordion || !triggerDetailsQuery) return;

      if (isExpanding) {
        setIsLoadingExpanded((prev) => ({ ...prev, [rowId]: true }));

        try {
          const result = await triggerDetailsQuery({
            apiKey,
            // Use keyField as the param name: sends { id: ... } for OrderSummary
            // and { item_code: ... } for RepackingAdjustment
            [tableConfig.keyField]: rowData?.[tableConfig.keyField],
            usePagination: false,
          }).unwrap();

          setExpandableData((prev) => ({
            ...prev,
            [rowId]: result?.items || result || [],
          }));
        } catch {
          toast.error("Failed to load details");
          return;
        } finally {
          setIsLoadingExpanded((prev) => ({ ...prev, [rowId]: false }));
        }
      }

      setExpandedRows((prev) => ({ ...prev, [rowId]: isExpanding }));
    },
    [apiKey, triggerDetailsQuery, tableConfig],
  );

  // ── Export handlers ──────────────────────────────────────────────────────────

  const handleExcelExport = useCallback(async () => {
    if (shouldSkipQuery) {
      toast.error("Please select a date range before exporting.");
      return;
    }
    setIsExporting(true);
    try {
      await exportToExcel({
        moduleKey,
        exportData: null,
        reportData,
        apiKey,
        apiQuery: triggerLazyQuery,
        searchParams: { search: searchValue },
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
        apiKey,
        usePagination: false,
        search: searchValue,
        ...reportData,
      });
    } catch {
      setShowPrintPreview(false);
    }
  }, [fetchPrintData, triggerLazyQuery, apiKey, searchValue, reportData]);

  const handlePrintPreviewClose = useCallback(
    () => setShowPrintPreview(false),
    [],
  );

  const getPrintFilenameProps = () => ({
    moduleName: moduleInfo.title,
    companyName: info.companyName,
    startDate: reportData?.startDate,
    endDate: reportData?.endDate,
    searchFilter: searchValue,
    customTitle: `${moduleInfo.title} Report`,
  });

  // ── Accordion config ─────────────────────────────────────────────────────────

  const accordionConfig = tableConfig.isAccordion
    ? {
        keyField: tableConfig.keyField || "id",
        detailsApi: handleRowExpand,
        detailsHeaders,
        quantityField: tableConfig.quantityField, // controls disabled state
        clickableField: tableConfig.clickableField, // field rendered as link in expanded rows
        onDetailCellClick: tableConfig.onDetailCellClick, // (detailRow, parentRow) => void
        summaryField: tableConfig.summaryField, // field to sum in expanded footer
        summaryLabel: tableConfig.summaryLabel, // label shown next to the sum
      }
    : null;

  // ── Table / export props ─────────────────────────────────────────────────────

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

  // ── Render ───────────────────────────────────────────────────────────────────

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
            hasSearch={searchConfig.hasSearch !== false}
            searchType={searchConfig.searchType || "text"}
            hasDropdown={
              !!(
                searchConfig.dropdownOptions?.length ||
                moduleInfo.dropdownOptions
              )
            }
            dropdownOptions={
              searchConfig.dropdownOptions?.length
                ? searchConfig.dropdownOptions
                : moduleInfo.dropdownOptions || []
            }
            dropdownLabel={searchConfig.dropdownLabel || "Type"}
            isDropdownLoading={searchConfig.isDropdownLoading || false}
            dropdownValue={searchConfig.dropdownValue}
            onDropdownChange={searchConfig.onDropdownChange}
            isLoading={isDataLoading}
            isFetching={isDataFetching}
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

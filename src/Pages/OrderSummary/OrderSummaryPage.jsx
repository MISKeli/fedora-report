import DynamicReportPage from "../../components/pages/DynamicReportPage";
import {
  useLazyOrderServedQuery,
  useLazyOrderSummaryQuery,
  useOrderSummaryQuery,
} from "../../features/api/orderSummaryApi";
import { info } from "../../schema/info";
import "../../styles/Pages/orderSummary.scss";

const OrderSummaryPage = () => {
  const config = {
    moduleKey: "orderSummary",
    useQuery: useOrderSummaryQuery,
    useLazyQuery: useLazyOrderSummaryQuery,
    useDetailsQuery: useLazyOrderServedQuery,
    tableConfig: {
      isAccordion: true,
      keyField: "id",
      quantityField: "qtyDelivered",
      // Don't specify detailsHeaders - it will auto-use info.orderSummary.served
    },
    searchConfig: {
      hasDatePicker: true,
      updateQueryParams: true,
      searchType: "both",
    },
    exportConfig: {
      showExcelExport: true,
      showPrintExport: true,
      excelLabel: "Download Report",
      variant: "contained",
      size: "medium",
    },
    customClassName: "order",
  };

  return <DynamicReportPage config={config} />;
};

export default OrderSummaryPage;

// import { Box, Button, Divider } from "@mui/material";
// import React, { useCallback, useEffect, useState } from "react";
// import PageHeader from "../../components/headers/PageHeader";
// import { info } from "../../schema/info";
// import DateSearch from "../../components/headers/DateSearch";

// import "../../styles/Pages/orderSummary.scss";
// import {
//   useOrderSummaryQuery,
//   useLazyOrderSummaryQuery,
//   useOrderServedQuery,
//   useLazyOrderServedQuery,
// } from "../../features/api/orderSummaryApi";
// import { useSelector } from "react-redux";
// import CommonTable from "../../components/tables/CommonTable";

// import { toast } from "sonner";
// import useExportData from "../../hooks/useExportData";
// import ExportMenu from "../../components/buttons/ExportMenu";
// import {
//   PrintPreviewDialog,
//   usePrintData,
// } from "../../components/dialogs/PrintPreviewDialog";
// import AccordionTable from "../../components/tables/AccordionTable";

// const OrderSummaryPage = () => {
//   const apiKey = useSelector((state) => state.auth.apiKey);
//   const { exportToExcel } = useExportData();

//   const [itemCodeSearch, setItemCodeSearch] = useState("");
//   const [reportData, setReportData] = useState(null);
//   const [isExporting, setIsExporting] = useState(false);

//   // Print state
//   const [showPrintPreview, setShowPrintPreview] = useState(false);
//   const { printData, isPrintLoading, fetchPrintData } = usePrintData();

//   // Pagination state
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   // Accordion state
//   const [expandedRows, setExpandedRows] = useState({});
//   const [expandableData, setExpandableData] = useState({});
//   const [isLoadingExpanded, setIsLoadingExpanded] = useState({});

//   // Lazy query for served data when expanding rows
//   const [triggerServedQuery] = useLazyOrderServedQuery();

//   // Regular query for display
//   const shouldSkipQuery =
//     !reportData || !reportData.startDate || !reportData.endDate;

//   const {
//     data: orderData,
//     isLoading: isDataLoading,
//     isFetching: isDataFetching,
//   } = useOrderSummaryQuery(
//     {
//       apiKey: apiKey,
//       usePagination: true,
//       search: itemCodeSearch,
//       pageNumber: page + 1,
//       pageSize: rowsPerPage,
//       ...reportData,
//     },
//     {
//       skip: shouldSkipQuery,
//     }
//   );

//   // Lazy query for export and print (to fetch all data)
//   const [triggerExportQuery] = useLazyOrderSummaryQuery();

//   const header = info?.orderSummary?.tableHeader || [];
//   const servedHeaders = info?.orderSummary?.served || [];
//   const rows = orderData?.items || [];
//   const totalCount = orderData?.totalCount || 0;

//   // Reset to first page when search changes
//   useEffect(() => {
//     setPage(0);
//   }, [itemCodeSearch, reportData]);

//   // Handle search changes
//   const handleSearchChange = useCallback((searchValue) => {
//     setItemCodeSearch(searchValue);
//   }, []);

//   // Handle report data changes
//   const handleReportDataChange = useCallback(async (data) => {
//     setReportData(data);
//   }, []);

//   // Pagination handlers
//   const handleChangePage = useCallback((event, newPage) => {
//     setPage(newPage);
//   }, []);

//   const handleChangeRowsPerPage = useCallback((event) => {
//     const newRowsPerPage = parseInt(event.target.value, 10);
//     setRowsPerPage(newRowsPerPage);
//     setPage(0);
//   }, []);

//   // Handle row expansion - fetch served data for the specific order
//   const handleRowExpand = useCallback(
//     async (rowId, isExpanding) => {
//       if (isExpanding && !expandableData[rowId]) {
//         setIsLoadingExpanded((prev) => ({ ...prev, [rowId]: true }));

//         try {
//           const result = await triggerServedQuery({
//             apiKey: apiKey,
//             id: rowId.toString(),
//           }).unwrap();

//           setExpandableData((prev) => ({
//             ...prev,
//             [rowId]: result || [],
//           }));
//         } catch (error) {

//           toast.error("Failed to load delivery details");
//           // Don't expand if data fetch failed
//           return;
//         } finally {
//           setIsLoadingExpanded((prev) => ({ ...prev, [rowId]: false }));
//         }
//       }

//       setExpandedRows((prev) => ({
//         ...prev,
//         [rowId]: isExpanding,
//       }));
//     },
//     [apiKey, triggerServedQuery, expandableData]
//   );

//   // // Accordion configuration
//   // const accordionConfig = {
//   //   keyField: "id",
//   //   detailsApi: handleRowExpand,
//   //   detailsHeaders: servedHeaders,
//   // };

//   // Excel Export handler
//   const handleExcelExport = useCallback(async () => {
//     if (!reportData || !reportData.startDate || !reportData.endDate) {
//       toast.error("Please select a date range before exporting.");
//       return;
//     }

//     setIsExporting(true);

//     try {
//       await exportToExcel({
//         moduleKey: "orderSummary", // Key from info object
//         exportData: null, // Use current data if available
//         reportData: reportData,
//         apiKey: apiKey,
//         apiQuery: triggerExportQuery,
//         searchParams: {
//           search: itemCodeSearch,
//         },
//       });
//     } catch (error) {
//       console.error("Excel export failed:", error);
//     } finally {
//       setIsExporting(false);
//     }
//   }, [
//     exportToExcel,
//     //rows,
//     reportData,
//     apiKey,
//     triggerExportQuery,
//     itemCodeSearch,
//   ]);

//   // Enhanced Print handler
//   const handlePrintExport = useCallback(async () => {
//     try {
//       setShowPrintPreview(true);

//       // Fetch all data for printing (without pagination)
//       await fetchPrintData(triggerExportQuery, {
//         apiKey: apiKey,
//         usePagination: false, // This is key - get ALL data
//         search: itemCodeSearch,
//         ...reportData,
//       });
//     } catch (error) {

//       // Close preview if data fetch fails
//       setShowPrintPreview(false);
//     }
//   }, [fetchPrintData, triggerExportQuery, apiKey, itemCodeSearch, reportData]);
//   // Enhanced print filename props with more context
//   const getPrintFilenameProps = () => {
//     return {
//       moduleName: info.orderSummary.title,
//       companyName: info.companyName,
//       startDate: reportData?.startDate,
//       endDate: reportData?.endDate,
//       searchFilter: itemCodeSearch,
//       customTitle: `${info.orderSummary.title} Report`,
//     };
//   };

//   // Handle print preview close
//   const handlePrintPreviewClose = useCallback(() => {
//     setShowPrintPreview(false);
//   }, []);
// // Accordion configuration
// const accordionConfig = {
//   keyField: "id",
//   detailsApi: handleRowExpand,
//   detailsHeaders: servedHeaders,
//   quantityField: "qtyDelivered", // Add this line
// };

//   return (
//     <Box className="order">
//       <Box className="order__header">
//         <Box className="order__header__content">
//           <PageHeader title={info.orderSummary.title} />
//           <DateSearch
//             searchPlaceHolder={info.orderSummary.placeHolader}
//             onSearchChange={handleSearchChange}
//             searchValue={itemCodeSearch}
//             setReportData={handleReportDataChange}
//             updateQueryParams={true}
//             hasDatePicker={true}
//           />
//         </Box>
// {/*
//         <Box className="order__header__export" sx={{ paddingLeft: "10px" }}>
//           <ExportMenu
//             onExcelExport={handleExcelExport}
//             onPrintExport={handlePrintExport}
//             isExporting={isExporting}
//             disabled={shouldSkipQuery || isDataLoading}
//             variant="outlined"
//             size="medium"
//           />
//         </Box> */}
//       </Box>

//       <Box className="order__body">
//         {/* <CommonTable
//           header={header}
//           data={orderData}
//           rows={rows}
//           page={page}
//           rowsPerPage={rowsPerPage}
//           totalCount={totalCount}
//           handleChangePage={handleChangePage}
//           handleChangeRowsPerPage={handleChangeRowsPerPage}
//           isFetching={isDataFetching}
//           isLoading={isDataLoading}
//         /> */}
//         <AccordionTable
//           header={header}
//           data={orderData}
//           rows={rows}
//           page={page}
//           rowsPerPage={rowsPerPage}
//           totalCount={totalCount}
//           handleChangePage={handleChangePage}
//           handleChangeRowsPerPage={handleChangeRowsPerPage}
//           isFetching={isDataFetching}
//           isLoading={isDataLoading}
//           // Accordion props
//           expandableConfig={accordionConfig}
//           onRowExpand={handleRowExpand}
//           expandedRows={expandedRows}
//           expandableData={expandableData}
//           isLoadingExpanded={isLoadingExpanded}

//           // Export functionality
//           onExcelExport={handleExcelExport}
//           onPrintExport={handlePrintExport}
//           excelLabel="Download Report"
//           isExporting={isExporting}
//           showExportMenu={true}
//           exportVariant="outlined"
//           exportSize="medium"
//         />
//       </Box>
//       {/* Enhanced Print Preview Dialog */}
//       <PrintPreviewDialog
//         isOpen={showPrintPreview}
//         onClose={handlePrintPreviewClose}
//         data={printData}
//         headers={header}
//         isLoading={isPrintLoading}
//         {...getPrintFilenameProps()}
//       />
//     </Box>
//   );
// };

// export default OrderSummaryPage;

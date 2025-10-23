import DynamicReportPage from "../../components/pages/DynamicReportPage";
import {
  useLazyReportsQuery,
  useReportsQuery,
} from "../../features/api/fgInventoryApi";
import "../../styles/Pages/FGInventory.scss";

const FGInventoryPage = () => {
  const config = {
    moduleKey: "FGInventory",
    useQuery: useReportsQuery,
    
    useLazyQuery: useLazyReportsQuery,
    tableConfig: {
      isAccordion: false,
    },
    searchConfig: {
      hasDatePicker: false,
      updateQueryParams: true,
      //placeholder: "Search inventory...",
      searchType: "both", // Options: "text", "number", or "both"
      searchParamName: "itemCode",
    },
    exportConfig: {
      showExcelExport: true,
      showPrintExport: true,
      excelLabel: "Download Report",
      variant: "outlined",
      size: "medium",
    },
    customClassName: "fgInventory",
  };


  return <DynamicReportPage config={config} />;
};

export default FGInventoryPage;

/// FGInventoryPage.js - Updated with Enhanced Print Integration
// import React, { useState, useCallback, useEffect } from "react";
// import { useSelector } from "react-redux";
// import CommonTable from "../../components/tables/CommonTable";
// import { Box, Button, Typography } from "@mui/material";
// import { info } from "../../schema/info";
// import PageHeader from "../../components/headers/PageHeader";
// import DateSearch from "../../components/headers/DateSearch";
// import "../../styles/Pages/FGInventory.scss";
// import {
//   useLazyReportsQuery,
//   useReportsQuery,
// } from "../../features/api/fgInventoryApi";
// import useExportData from "../../hooks/useExportData";
// import ExportMenu from "../../components/buttons/ExportMenu";
// import {
//   PrintPreviewDialog,
//   usePrintData,
// } from "../../components/dialogs/PrintPreviewDialog";
// import { toast } from "sonner";

// const FGInventoryPage = () => {
//   const apiKey = useSelector((state) => state.auth.apiKey);
//   const { exportToExcel } = useExportData();

//   // State for search and date filters
//   const [itemCodeSearch, setItemCodeSearch] = useState("");
//   const [reportData, setReportData] = useState(null);

//   // Pagination state
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   const [isExporting, setIsExporting] = useState(false);

//   // Print state
//   const [showPrintPreview, setShowPrintPreview] = useState(false);
//   const { printData, isPrintLoading, fetchPrintData } = usePrintData();

//   const {
//     data: fgData,
//     isLoading: isDataLoading,
//     isFetching: isDataFetching,
//   } = useReportsQuery({
//     apiKey: apiKey,
//     usePagination: true,
//     itemCode: itemCodeSearch,
//     pageNumber: page + 1,
//     pageSize: rowsPerPage,
//     ...reportData,
//   });

//   // Lazy query for export and print (to fetch all data)
//   const [triggerExportQuery] = useLazyReportsQuery();

//   const header = info?.FGInventory?.tableHeader || [];
//   const rows = fgData?.items || [];

//   // Get total count from your API response structure
//   const totalCount = fgData?.totalCount || 0;
//   const totalPages = fgData?.totalPages || 0;
//   const currentPageNumber = fgData?.pageNumber || 1;
//   const currentPageSize = fgData?.pageSize || rowsPerPage;

//   // Reset to first page when search changes
//   useEffect(() => {
//     setPage(0);
//   }, [itemCodeSearch, reportData]);

//   // Handle search changes
//   const handleSearchChange = useCallback((searchValue) => {
//     setItemCodeSearch(searchValue);
//   }, []);

//   // Handle report data changes (from date picker)
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

//   // Excel Export handler
//   const handleExcelExport = useCallback(async () => {
//     setIsExporting(true);

//     try {
//       await exportToExcel({
//         moduleKey: "FGInventory",
//         exportData: null,
//         reportData: reportData,
//         apiKey: apiKey,
//         apiQuery: triggerExportQuery,
//         // searchParams: {
//         //   itemCode: itemCodeSearch,
//         // },
//       });
//     } catch (error) {
//       toast.error("Excel export failed:", error);
//     } finally {
//       setIsExporting(false);
//     }
//   }, [exportToExcel, reportData, apiKey, triggerExportQuery, itemCodeSearch]);

//   // Enhanced Print handler
//   const handlePrintExport = useCallback(async () => {
//     try {
//       setShowPrintPreview(true);

//       // Fetch all data for printing (without pagination)
//       await fetchPrintData(triggerExportQuery, {
//         apiKey: apiKey,
//         usePagination: false, // This is key - get ALL data
//         //itemCode: itemCodeSearch,
//         ...reportData,
//       });
//     } catch (error) {
//       console.error("Print data fetch failed:", error);
//       // Close preview if data fetch fails
//       setShowPrintPreview(false);
//     }
//   }, [fetchPrintData, triggerExportQuery, apiKey, itemCodeSearch, reportData]);

//   // Enhanced print filename props with more context
//   const getPrintFilenameProps = () => {
//     return {
//       moduleName: info.FGInventory.title,
//       companyName: info.companyName,
//       startDate: reportData?.startDate,
//       endDate: reportData?.endDate,
//       //searchFilter: itemCodeSearch,
//       customTitle: `${info.FGInventory.title} Report`,
//     };
//   };

//   // Handle print preview close
//   const handlePrintPreviewClose = useCallback(() => {
//     setShowPrintPreview(false);
//   }, []);

//   return (
//     <Box className="fgInventory">
//       <Box className="fgInventory__header">
//         <Box className="fgInventory__header__content">
//           <PageHeader title={info.FGInventory.title} />
//           <DateSearch
//             searchPlaceHolder={info.FGInventory.placeHolader}
//             onSearchChange={handleSearchChange}
//             searchValue={itemCodeSearch}
//             setReportData={handleReportDataChange}
//             updateQueryParams={true}
//             hasDatePicker={false}
//           />
//         </Box>
//         {/* <Box className="fgInventory__header__export">
//           <ExportMenu
//             onExcelExport={handleExcelExport}
//             onPrintExport={handlePrintExport}
//             isExporting={isExporting || isPrintLoading}
//             disabled={isDataLoading}
//             variant="outlined"
//             size="medium"
//           />
//         </Box> */}
//       </Box>

//       <Box className="fgInventory__body">
//         {/* <CommonTable
//           header={header}
//           data={fgData}
//           rows={rows}
//           page={page}
//           rowsPerPage={rowsPerPage}
//           totalCount={totalCount}
//           handleChangePage={handleChangePage}
//           handleChangeRowsPerPage={handleChangeRowsPerPage}
//           isFetching={isDataFetching}
//           isLoading={isDataLoading}
//         /> */}

//         <CommonTable
//           header={header}
//           data={fgData}
//           rows={rows}
//           page={page}
//           rowsPerPage={rowsPerPage}
//           totalCount={totalCount}
//           handleChangePage={handleChangePage}
//           handleChangeRowsPerPage={handleChangeRowsPerPage}
//           isFetching={isDataFetching}
//           isLoading={isDataLoading}
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

//       <Box className="fgInventory__footer">
//         {/* Footer content if needed */}
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

// export default FGInventoryPage;

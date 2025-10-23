import DynamicReportPage from "../../components/pages/DynamicReportPage";
import {
  useLazyOrderServedQuery,
  useLazyOrderSummaryQuery,
  useOrderSummaryQuery,
} from "../../features/api/orderSummaryApi";
import { info } from "../../schema/info";
import "../../styles/Pages/orderSummary.scss";

const ConsolidatedReportFinancePage = () => {
  const config = {
    moduleKey: "consolidatedFinanceReport", // You'd add this to info.js
    useQuery: useOrderSummaryQuery,
    useLazyQuery: useLazyOrderSummaryQuery,
    useDetailsQuery: () => [useLazyOrderServedQuery()],
    // No details query - simple table
    // tableConfig: {
    //   isAccordion: false, // Simple table
    // },
    tableConfig: {
      isAccordion: false,
      keyField: "id",
      quantityField: "qtyDelivered",
      detailsHeaders: null, // Will use moduleInfo.served
    },
    searchConfig: {
      //placeholder: info.consolidatedFinanceReport.placeHolader,
      hasDatePicker: true,
      updateQueryParams: true,
    },
    exportConfig: {
      showExcelExport: true,
      showPrintExport: true,
      excelLabel: "Download Report sample",
      variant: "contained",
      //size: "small",
    },
    customClassName: "order",
  };

  return <DynamicReportPage config={config} />;
};

export default ConsolidatedReportFinancePage;

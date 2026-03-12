import React, { useState } from "react";
import DynamicReportPage from "../../components/pages/DynamicReportPage";
import {
  useRmMacroQuery,
  useRmMicroQuery,
  useLazyRmMacroQuery,
  useLazyRmMicroQuery,
  useLazyRmReceivedQuery,
} from "../../features/api/repackingAdjustmentApi";
import RepackingAdjustmentDialog from "./RepackingAdjustmentDialog";

const RepackingAdjustmentPage = () => {
  const [type, setType] = useState("micro");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDetailRow, setDialogDetailRow] = useState(null);
  const [dialogParentRow, setDialogParentRow] = useState(null);

  // When user clicks a receivedID cell in the expanded accordion
  const handleDetailCellClick = (detailRow, parentRow) => {
    setDialogDetailRow(detailRow);
    setDialogParentRow(parentRow);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogDetailRow(null);
    setDialogParentRow(null);
  };

  const config = {
    moduleKey: "repackingAdjustment",
    useQuery: type === "micro" ? useRmMicroQuery : useRmMacroQuery,
    useLazyQuery: type === "micro" ? useLazyRmMicroQuery : useLazyRmMacroQuery,
    useDetailsQuery: useLazyRmReceivedQuery,

    tableConfig: {
      isAccordion: true,
      keyField: "item_code",
      quantityField: "onhand", // ← disable expand arrow when onhand === 0
      clickableField: "receivedID", // ← make receivedID cells clickable in expanded rows
      onDetailCellClick: handleDetailCellClick,
      summaryField: "actualcountgood", // ← sum this field in the expanded footer
      summaryLabel: "Total Actual Good", // ← label shown next to the sum
    },

    searchConfig: {
      hasDatePicker: false,
      updateQueryParams: true,
      searchType: "both",
      searchParamName: "itemCode",
      dropdownValue: type,
      onDropdownChange: (value) => setType(value),
    },

    exportConfig: {
      showExcelExport: true,
      showPrintExport: true,
    },

    customClassName: "fgInventory",
  };

  return (
    <>
      <DynamicReportPage config={config} />

      <RepackingAdjustmentDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        detailRow={dialogDetailRow}
        parentRow={dialogParentRow}
        //onSubmit={handleDialogSubmit}
      />
    </>
  );
};

export default RepackingAdjustmentPage;

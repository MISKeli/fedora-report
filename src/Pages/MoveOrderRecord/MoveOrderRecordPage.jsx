import { Box, Button, Typography } from "@mui/material";
import React, { useCallback, useState, useEffect, useRef } from "react";
import PageHeader from "../../components/headers/PageHeader";
import DateSearch from "../../components/headers/DateSearch";
import { info } from "../../schema/info";
import { useMoveOrderQuery } from "../../features/api/moveOrderSlipApi";
import { useSelector } from "react-redux";
import CommonTable from "../../components/tables/CommonTable";
import QRCode from "qrcode";
import "../../styles/Pages/moveOrder.scss";
import MoveOrderTable from "../../components/tables/MoveOrderTable";
import ExportMenu from "../../components/buttons/ExportMenu";
import { toast } from "sonner";

const MoveOrderRecordPage = () => {
  const apiKey = useSelector((state) => state.auth.apiKey);
  const qrRef = useRef(null);
  const printContainerRef = useRef(null);

  const [itemCodeSearch, setItemCodeSearch] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrError, setQrError] = useState(false);
  const [isPrintLoading, setPrintLoading] = useState(false);

  // Handle search changes
  const handleSearchChange = useCallback((searchValue) => {
    setItemCodeSearch(searchValue);
    // Clear QR code when search is cleared
    if (!searchValue) {
      setQrCodeUrl("");
      setQrError(false);
    }
  }, []);

  // Only run the query if there's a search value
  const {
    data: moveOrder,
    isLoading: isDataLoading,
    isFetching: isDataFetching,
    isError,
    error,
  } = useMoveOrderQuery(
    {
      apiKey: apiKey,
      id: itemCodeSearch,
    },
    {
      skip: !itemCodeSearch,
    }
  );

  const accountTitle = moveOrder?.accountTitle || "";
  const address = moveOrder?.address || "";
  const customer = moveOrder?.customer || "";
  const id = moveOrder?.id || "";
  const moveOrderDate = moveOrder?.moveOrderDate || "";
  const plateNumber = moveOrder?.plateNumber || "";
  const employeeName = moveOrder?.employeeName || "";
  const qrValue = moveOrder?.qrValue || "";
  const warehouse = moveOrder?.warehouse || "";

  //table needs
  const header = info?.moveOrder?.tableHeader || [];
  const rows = moveOrder?.items || [];

  // Calculate total quantity
  const totalQuantity = rows.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  // Generate QR Code - only if there's a search value and qrValue
  useEffect(() => {
    const generateQRCode = async () => {
      if (qrValue && itemCodeSearch) {
        try {
          setQrError(false);
          const url = await QRCode.toDataURL(qrValue, {
            width: 600,
            margin: 1,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
          setQrCodeUrl(url);
        } catch (error) {
          setQrError(true);
          setQrCodeUrl("");
        }
      } else {
        setQrCodeUrl("");
        setQrError(false);
      }
    };

    generateQRCode();
  }, [qrValue, itemCodeSearch]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return dateString;
    }
  };

  // Print function for Move Order
  const handlePrintExport = useCallback(async () => {
    if (!moveOrder || !id) {
      toast.error("No move order data available to print");
      return;
    }

    if (!printContainerRef.current) {
      toast.error("Print container not found");
      return;
    }

    setPrintLoading(true);

    try {
      // Show loading toast
      toast.info("Preparing move order for printing...", { duration: 2000 });

      // Create a new window for printing
      const printWindow = window.open("", "_blank", "width=800,height=900");

      if (!printWindow) {
        toast.error("Popup blocked. Please allow popups and try again.");
        return;
      }

      // Wait a moment for QR code to be fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get the move order container HTML
      const moveOrderHTML = printContainerRef.current.innerHTML;

      // Generate print-specific HTML
      const printHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Move Order - ${id}</title>
            <meta charset="utf-8">
            <style>
              ${generateMoveOrderPrintStyles()}
            </style>
          </head>
          <body>
            <div class="print-move-order">
              ${moveOrderHTML}
            </div>
          </body>
        </html>
      `;

      // Write to print window
      printWindow.document.write(printHTML);
      printWindow.document.close();

      // Focus and print
      printWindow.focus();

      // Small delay to ensure content is rendered
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        toast.success("Move order sent to printer successfully!");
      }, 1000);
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print move order. Please try again.");
    } finally {
      setPrintLoading(false);
    }
  }, [moveOrder, id]);

  // Generate print-specific CSS styles
  const generateMoveOrderPrintStyles = () => {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', Arial, sans-serif;
        line-height: 1.4;
        color: #000;
        background: white;
        margin: 0;
        padding: 15mm;
      }
      
      .print-move-order {
        width: 100%;
        max-width: none;
        margin: 0;
        background: white;
        border: 2px solid #000;
        padding: 20px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.4;
      }

      /* Header styles */
      .moveOrder__container__header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
        margin-bottom: 20px !important;
        gap: 20px !important;
      }

      .moveOrder__container__header__companyInfo {
        flex: 1 !important;
      }

      .moveOrder__container__header__companyInfo--companyName {
        font-size: 16px !important;
        font-weight: bold !important;
        margin-bottom: 8px !important;
        color: #000 !important;
      }

      .moveOrder__container__header__companyInfo--companyAddress {
        font-size: 12px !important;
        margin-bottom: 20px !important;
        color: #333 !important;
        line-height: 1.3 !important;
      }

      .moveOrder__container__header__companyInfo--documentTitle {
        font-size: 16px !important;
        font-weight: bold !important;
        text-align: center !important;
        color: #000 !important;
        margin-top: 10px !important;
      }

      .moveOrder__container__header__qrCode {
        width: 120px !important;
        height: 120px !important;
        border: 2px solid #000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: white !important;
        flex-shrink: 0 !important;
      }

      .moveOrder__container__header__qrCode img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
      }

      /* Info section styles */
      .moveOrder__container__info {
        margin-bottom: 20px !important;
        font-size: 12px !important;
      }

      .moveOrder__container__info__row1,
      .moveOrder__container__info__row2,
      .moveOrder__container__info__row3 {
        display: flex !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
        margin-bottom: 6px !important;
      }

      .moveOrder__container__info p,
      .moveOrder__container__info div {
        font-size: 12px !important;
        line-height: 1.5 !important;
        color: #000 !important;
        margin: 0 !important;
      }

      /* Table styles */
      .moveOrder__container__table {
        margin: 20px 0 !important;
      }

      .moveOrder__container__table table {
        width: 100% !important;
        border-collapse: collapse !important;
        border: 2px solid #000 !important;
      }

      .moveOrder__container__table th,
      .moveOrder__container__table td {
        border: 1px solid #000 !important;
        padding: 8px 6px !important;
        text-align: center !important;
        vertical-align: middle !important;
        font-size: 11px !important;
        line-height: 1.2 !important;
      }

      .moveOrder__container__table th {
        background-color: white !important;
        font-weight: bold !important;
      }

      /* Description column left align */
      .moveOrder__container__table td:nth-child(3) {
        text-align: left !important;
      }

      /* Summary styles */
      .moveOrder__container__summary {
        margin: 20px 0 !important;
      }

      .moveOrder__container__summary__section1 {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        margin-bottom: 16px !important;
      }

      .moveOrder__container__summary p {
        font-size: 12px !important;
        font-weight: bold !important;
        color: #000 !important;
        margin: 0 !important;
      }

      /* Signature styles */
      .moveOrder__container__signature {
        display: flex !important;
        justify-content: space-between !important;
        margin: 40px 0 !important;
        gap: 48px !important;
      }

      .moveOrder__container__signature__block {
        flex: 1 !important;
        max-width: 300px !important;
      }

      .moveOrder__container__signature__block--label {
        font-size: 12px !important;
        font-weight: bold !important;
        margin-bottom: 20px !important;
        color: #000 !important;
      }

      .moveOrder__container__signature__block--line {
        border-bottom: 1px solid #000 !important;
        height: 30px !important;
        margin-bottom: 8px !important;
        width: 100% !important;
        display: block !important;
      }

      .moveOrder__container__signature__block--caption {
        font-size: 10px !important;
        text-align: center !important;
        color: #000 !important;
      }

      /* End section */
      .moveOrder__container__end {
        text-align: center !important;
        margin: 30px 0 20px 0 !important;
        padding: 10px 0 !important;
      }

      .moveOrder__container__end p {
        font-size: 12px !important;
        font-weight: bold !important;
        color: #000 !important;
        margin: 0 !important;
      }

      /* Hide elements that shouldn't print */
      .MuiTablePagination-root,
      .moveOrder__header {
        display: none !important;
      }

      /* Print media query */
      @media print {
        @page {
          size: A4;
          margin: 15mm 10mm;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .print-move-order {
          border: none !important;
          padding: 15px !important;
          font-size: 11px !important;
        }
      }
    `;
  };

  // Direct print without preview
  const handleDirectPrint = useCallback(() => {
    if (!moveOrder || !id) {
      toast.error("No move order data available to print");
      return;
    }

    // Use the browser's built-in print function with the current page
    const originalTitle = document.title;
    document.title = `Move Order - ${id}`;

    // Hide non-printable elements temporarily
    const headerElement = document.querySelector(".moveOrder__header");
    if (headerElement) {
      headerElement.style.display = "none";
    }

    toast.info("Opening print dialog...");

    setTimeout(() => {
      window.print();

      // Restore original state
      document.title = originalTitle;
      if (headerElement) {
        headerElement.style.display = "";
      }
    }, 100);
  }, [moveOrder, id]);

  // Replace your current handleExcelExport with:
  const handleExcelExport = useCallback(() => {
    if (!qrCodeUrl) {
      toast.error("No QR code available to download");
      return;
    }

    if (!id) {
      toast.error("Order ID not available for download");
      return;
    }

    try {
      toast.info("Downloading QR code...");

      // Convert data URL to blob
      fetch(qrCodeUrl)
        .then((response) => response.blob())
        .then((blob) => {
          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");

          // Generate filename with order ID and timestamp
          const timestamp = new Date().toISOString().split("T")[0];
          const filename = `OrderNo_${id}.png`;

          link.href = url;
          link.download = filename;
          link.style.display = "none";

          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up
          URL.revokeObjectURL(url);

          toast.success(`QR code downloaded: ${filename}`);
        })
        .catch((error) => {
          console.error("QR download error:", error);
          toast.error("Failed to download QR code");
        });
    } catch (error) {
      console.error("QR export error:", error);
      toast.error("Failed to export QR code");
    }
  }, [qrCodeUrl, id]);

  // Keyboard shortcut for print
  useEffect(() => {
    const handleKeyPress = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "p") {
        event.preventDefault();
        handleDirectPrint();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleDirectPrint]);

  // Check if we have valid data
  const hasValidData = moveOrder && moveOrder.id && !isError;

  // Show toast when error occurs (only once per error state change)
  if (isError && itemCodeSearch && !isDataLoading) {
    const errorMessage = error?.data?.message || "Move Order Slip not found";
    toast.error(errorMessage);
  }

  // Determine what to show
  const shouldShowMoveOrderData = Boolean(itemCodeSearch);
  const showError = shouldShowMoveOrderData && !isDataLoading && !hasValidData;
  const showData = shouldShowMoveOrderData && hasValidData;
  return (
    <>
      <Box className="moveOrder">
        <Box className="moveOrder__header">
          <Box className="moveOrder__header__content">
            <PageHeader title={info.moveOrder.title} />
            <DateSearch
              onSearchChange={handleSearchChange}
              searchValue={itemCodeSearch}
              updateQueryParams={true}
              hasDatePicker={false}
              searchPlaceHolder={info.moveOrder.placeHolader}
              searchType="number"
            />
          </Box>
        </Box>

        {/* Only render move order content if there's a search value */}
        {showData && (
          <Box
            className="moveOrder__container"
            ref={printContainerRef}
            sx={{ overflow: "auto" }}
          >
            {/* Header with QR Code */}
            <Box className="moveOrder__container__header">
              <Box className="moveOrder__container__header__companyInfo">
                <Typography className="moveOrder__container__header__companyInfo--companyName">
                  {info.moveOrder.company}
                </Typography>
                <Typography className="moveOrder__container__header__companyInfo--companyAddress">
                  {info.moveOrder.companyAddress}
                </Typography>
                <Typography className="moveOrder__container__header__companyInfo--documentTitle">
                  {info.moveOrder.documentTitle}
                </Typography>
              </Box>
              {/* QR Code */}
              <Box
                className={`moveOrder__container__header__qrCode ${
                  qrCodeUrl
                    ? "moveOrder__container__header__qrCode--hasQr"
                    : "moveOrder__container__header__qrCode--placeholder"
                } ${qrError ? "error" : ""}`}
                ref={qrRef}
              >
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : qrError ? (
                  "QR Error"
                ) : qrValue ? (
                  "Generating..."
                ) : null}
              </Box>
            </Box>

            {/* Order Information */}
            <Box className="moveOrder__container__info">
              {/* Row 1: Warehouse and Order No */}
              <Box className="moveOrder__container__info__row1">
                <Typography className="moveOrder__container__info__row1__warehouse">
                  <strong>Warehouse :</strong> {warehouse}
                </Typography>
                <Typography className="moveOrder__container__info__row1__orderInfo">
                  <strong>Order No :</strong> {id}
                </Typography>
              </Box>

              {/* Row 2: Account Title and Date */}
              <Box className="moveOrder__container__info__row2">
                <Typography className="moveOrder__container__info__row2__accountTitle">
                  <strong>Account Title :</strong> {accountTitle}
                </Typography>
                <Typography className="moveOrder__container__info__row2__dateInfo">
                  <strong>Date :</strong> {formatDate(moveOrderDate)}
                </Typography>
              </Box>

              {/* Row 3: Customer and Address */}
              <Box className="moveOrder__container__info__row3">
                <Typography className="moveOrder__container__info__row3__customer">
                  <strong>Customer :</strong> {customer}
                </Typography>
                <Typography className="moveOrder__container__info__row3__addressInfo">
                  <strong>Address :</strong> {address}
                </Typography>
              </Box>
            </Box>

            {/* TABLE */}
            <Box className="moveOrder__container__table">
              <MoveOrderTable
                header={header}
                data={moveOrder}
                rows={rows}
                isFetching={isDataFetching}
                isLoading={isDataLoading}
                isMoveOrderTable={false}
              />
            </Box>

            <Box className="moveOrder__container__summary">
              <Box className="moveOrder__container__summary__section1">
                <Typography className="moveOrder__container__summary__section1__plateNo">
                  <strong>Plate Number :</strong> {plateNumber}
                </Typography>
                <Typography className="moveOrder__container__summary__section1__qty">
                  <strong>TOTAL Qty :</strong> {totalQuantity}
                </Typography>
              </Box>
              <Box className="moveOrder__container__summary__section2">
                <Typography className="moveOrder__container__summary__section2__encodedBy">
                  <strong>Encoded by :</strong> {employeeName}
                </Typography>
              </Box>
            </Box>

            <Box className="moveOrder__container__signature">
              <Box className="moveOrder__container__signature__block">
                <Typography className="moveOrder__container__signature__block--label">
                  Delivered by :
                </Typography>
                <Typography className="moveOrder__container__signature__block--line"></Typography>
                <Typography className="moveOrder__container__signature__block--caption">
                  Signature Over Printed Name/Date
                </Typography>
              </Box>
              <Box className="moveOrder__container__signature__block">
                <Typography className="moveOrder__container__signature__block--label">
                  Received by :
                </Typography>
                <Typography className="moveOrder__container__signature__block--line"></Typography>
                <Typography className="moveOrder__container__signature__block--caption">
                  Signature Over Printed Name/Date
                </Typography>
              </Box>
            </Box>

            {/* END OF REPORT */}
            <Box className="moveOrder__container__end">
              <Typography>***** End of Report *****</Typography>
            </Box>
          </Box>
        )}

        {/* Only show status and export controls when there's data */}
        {showData && (
          <Box className="moveOrder__status">
            <Box className="moveOrder__status__export">
              <ExportMenu
                onExcelExport={handleExcelExport}
                onPrintExport={handlePrintExport}
                isExporting={isPrintLoading}
                disabled={isDataLoading || !moveOrder || !qrCodeUrl}
                variant="outlined"
                size="medium"
                customActions={[
                  {
                    label: "Direct Print",
                    onClick: handleDirectPrint,
                    disabled: isDataLoading || !moveOrder,
                  },
                  {
                    label: "QR Code (High Quality)",
                    onClick: () => handleQRExportWithOptions("png", 1.0, 800),
                    disabled: !qrCodeUrl || !id,
                  },
                ]}
              />
            </Box>

            {/* Status indicator */}
            {showError && (
              <Box className="moveOrder__status__info">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  alignItems={"center"}
                >
                  Move Order: {id} • Items: {rows.length} • Total Qty:{" "}
                  {totalQuantity}
                  {moveOrderDate && ` • Date: ${formatDate(moveOrderDate)}`}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Show error state */}
        {showError && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
              color: "error.main",
            }}
          >
            <Typography variant="h6">
              Move Order ID "{itemCodeSearch}" not found
            </Typography>
          </Box>
        )}

        {/* Show placeholder when no search */}
        {!shouldShowMoveOrderData && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
              color: "text.secondary",
            }}
          >
            <Typography variant="h6">
              Enter an Order ID to view move order details
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

export default MoveOrderRecordPage;

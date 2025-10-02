// utils/tableFormatters.js

/**
 * Formats numbers with comma separators
 * @param {number|string} value - The number to format
 * @returns {string} - Formatted number with commas
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "0";

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return value;

  // Format with commas, no decimal places for whole numbers
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numValue);
};

/**
 * Formats currency values
 * @param {number|string} value - The currency value to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (value, currency = "USD") => {
  if (value === null || value === undefined || value === "") return "$0.00";

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return value;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(numValue);
};

/**
 * Formats date strings to YYYY-MM-DD format
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";

  try {
    // Handle ISO date format like "2025-08-04T00:00:00"
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return dateString; // Return original if invalid

    // Format as YYYY-MM-DD
    return date.toISOString().split("T")[0];
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
};

/**
 * Formats datetime strings to readable format
 * @param {string|Date} dateString - The datetime to format
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return dateString;

    // Format as "Aug 4, 2025 10:30 AM"
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Formats percentage values
 * @param {number|string} value - The percentage value to format
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined || value === "") return "0%";

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return value;

  return `${formatNumber(numValue)}%`;
};

/**
 * Formats boolean values to Yes/No
 * @param {boolean|string} value - The boolean value to format
 * @returns {string} - "Yes" or "No"
 */
export const formatBoolean = (value) => {
  if (value === null || value === undefined) return "-";

  // Handle string boolean values
  if (typeof value === "string") {
    const lowerValue = value.toLowerCase();
    if (lowerValue === "true" || lowerValue === "1") return "Yes";
    if (lowerValue === "false" || lowerValue === "0") return "No";
    return value;
  }

  return value ? "Yes" : "No";
};

/**
 * Gets status configuration for chip styling
 * @param {string} status - The status value
 * @returns {Object} - Chip configuration with color and variant
 */
export const getStatusConfig = (status) => {
  if (!status) return { color: "default", variant: "outlined" };

  const lowerStatus = status.toString().toLowerCase();

  switch (lowerStatus) {
    case "pending":
    case "waiting":
    case "queued":
      return {
        color: "warning",
        variant: "filled",
        sx: { bgcolor: "#fff3cd", color: "#856404", fontWeight: 600 },
      };

    case "ongoing":
    case "in-progress":
    case "processing":
    case "active":
      return {
        color: "info",
        variant: "filled",
        sx: { bgcolor: "#cce7ff", color: "#014361", fontWeight: 600 },
      };

    case "complete":
    case "done":
    case "finished":
    case "success":
    case "approved":
      return {
        color: "success",
        variant: "filled",
        sx: { bgcolor: "#d1e7dd", color: "#0a3622", fontWeight: 600 },
      };

    case "failed":
    case "error":
    case "rejected":
    case "cancelled":
    case "declined":
      return {
        color: "error",
        variant: "filled",
        sx: { bgcolor: "#f8d7da", color: "#721c24", fontWeight: 600 },
      };

    case "draft":
    case "partial":
    case "inactive":
    case "disabled":
      return {
        color: "default",
        variant: "outlined",
        sx: { color: "#6c757d", borderColor: "#6c757d" },
      };

    default:
      return {
        color: "primary",
        variant: "outlined",
      };
  }
};

/**
 * Main formatting function that handles all data types
 * @param {any} value - The value to format
 * @param {Object} column - Column configuration with type information
 * @returns {string|Object} - Formatted value or React element config for status
 */
export const formatCellValue = (value, column) => {
  // Handle null/undefined/empty values
  if (value === null || value === undefined || value === "") {
    switch (column.type) {
      case "number":
      case "currency":
      case "decimal":
        return "0";
      case "percentage":
        return "0%";
      case "currency":
        return "$0.00";
      case "status":
        return {
          type: "status",
          value: "unknown",
          config: getStatusConfig("unknown"),
        };
      default:
        return "-";
    }
  }

  // Format based on column type
  switch (column.type) {
    case "number":
    case "decimal":
      return formatNumber(value);

    case "currency":
      return formatCurrency(value);

    case "date":
      return formatDate(value);

    case "datetime":
      return formatDateTime(value);

    case "percentage":
      return formatPercentage(value);

    case "boolean":
      return formatBoolean(value);

    case "status":
      return {
        type: "status",
        value: value.toString(),
        config: getStatusConfig(value),
      };

    case "text":
    default:
      return value.toString();
  }
};

/**
 * Gets the appropriate text alignment for a column type
 * @param {string} columnType - The column type
 * @returns {string} - MUI alignment value ('left', 'center', 'right')
 */
export const getCellAlignment = (columnType) => {
  switch (columnType) {
    case "number":
    case "currency":
    case "decimal":
    case "percentage":
      return "center";
    case "date":
    case "datetime":
    case "boolean":
    case "status":
      return "center";
    case "text":
    default:
      return "left";
  }
};

/**
 * Gets additional styling for specific column types
 * @param {string} columnType - The column type
 * @returns {Object} - MUI sx prop object
 */
export const getCellStyles = (columnType) => {
  const baseStyles = {};

  switch (columnType) {
    case "number":
    case "currency":
    case "decimal":
    case "percentage":
      return {
        ...baseStyles,
        fontVariantNumeric: "tabular-nums",
        fontWeight: 500,
      };

    case "date":
    case "datetime":
      return {
        ...baseStyles,
        fontFamily: "monospace",
        fontSize: "0.813rem",
      };

    case "boolean":
      return {
        ...baseStyles,
        fontWeight: 500,
      };

    default:
      return baseStyles;
  }
};

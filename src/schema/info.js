export const info = {
  format: {
    date: "YYYY-MM-DD",
  },
  fedora: {
    title: "FEDORA Report",
    subtitle: "Welcome back, sign in to continue",
    footer: "© 2025 MIS. All rights reserved.",
  },

  noData: " No data available",
  companyName: "RDF, Feed, Livestock and Foods Inc.",

  FGInventory: {
    title: "FG Inventory",
    placeHolader: "Feed Code...",
    tableHeader: [
      { id: "fgFeedCode", name: "FEED CODE", type: "text" },
      { id: "fgFeedType", name: "FEED TYPE", type: "text" },
      // { id: "inBags", name: "TOTAL IN BAGS", type: "number" },
      // { id: "inBulk", name: "TOTAL IN BULK", type: "number" },
      // { id: "outBag", name: "TOTAL OUT BAGS", type: "number" },
      // { id: "outBulk", name: "TOTAL OUT BULK", type: "number" },
      { id: "bagsSoh", name: "SOH BAGS", type: "number" },
      { id: "bulkSoh", name: "SOH BULK", type: "number" },
      { id: "soh", name: "STOCK ON HAND", type: "number" },
    ],
  },
  DFGInventory: {
    title: "Detailed FG Inventory",
    placeHolader: "Feed Code...",
    tableHeader: [
      { id: "prod_adv", name: "PRODUCTION ID", type: "text" },
      { id: "fg_feed_code", name: "FEED CODE", type: "text" },
      { id: "fg_feed_type", name: "FEED TYPE", type: "text" },
      { id: "remaining", name: "REMAINING SOH", type: "number" },
      { id: "fg_options", name: "CATEGORY", type: "text" },
      { id: "production_date", name: "PRODUCTION DATE", type: "date" },
      //{ id: "transaction_type", name: "TRANSACTION TYPE", type: "status" },
      { id: "aging", name: "AGING", type: "number" },
    ],
  },
  orderSummary: {
    title: "Order Summary",
    placeHolader: "MIR No, Farm Name, Feed Code...",
    tableHeader: [
      { id: "id", name: "ID", type: "text" },
      { id: "mirNo", name: "MIR NO", type: "text" },
      { id: "farmName", name: "FARM NAME", type: "text" },
      { id: "feedCode", name: "FEED CODE", type: "text" },
      { id: "feedType", name: "FEED TYPE", type: "text" },
      { id: "uom", name: "UNIT", type: "text" },
      { id: "qtyOrdered", name: "QUANTITY ORDERED", type: "number" },
      { id: "qtyDelivered", name: "QUANTITY DELIVERED", type: "number" },
      { id: "qtyRemaining", name: "QUANTITY REMAINING", type: "number" },
      { id: "prodPlanDate", name: "PROD PLAN DATE", type: "date" },
      {
        id: "expectedDeliveryDate",
        name: "EXPECTED DELIVERY DATE",
        type: "date",
      },
      { id: "orderChangeNo", name: "ORDER CHANGE NO", type: "text" },
      { id: "orderChangeRemarks", name: "ORDER CHANGE REMARKS", type: "text" },
      { id: "remarks", name: "REMARKS", type: "status" },
    ],
    served: [
      { id: "moveOrderDate", name: "MOVE ORDER DATE", type: "date" },
      { id: "id", name: "ID", type: "text" },
      // { id: "importId", name: "IMPORT ID", type: "text" },
      // { id: "mirNo", name: "MIR NO", type: "text" },
      // { id: "customer", name: "CUSTOMER", type: "text" },
      // { id: "address", name: "ADDRESS", type: "text" },
      //{ id: "feedCode", name: "FEED CODE", type: "text" },
      { id: "feedType", name: "FEED TYPE", type: "text" },
      { id: "fgOption", name: "FG OPTION", type: "text" },
      { id: "binNumber", name: "BIN NUMBER", type: "text" },
      { id: "quantity", name: "QUANTITY", type: "number" },
      { id: "prodDate", name: "PROD DATE", type: "date" },
      {
        id: "finishProductionDate",
        name: "FINISH PRODUCTION DATE",
        type: "date",
      },
      { id: "prodId", name: "PROD ID", type: "text" },
      { id: "plateNumber", name: "PLATE NO", type: "text" },
      { id: "status", name: "STATUS", type: "status" },
      { id: "deliveryDate", name: "DELIVERY DATE", type: "date" },
      {
        id: "transactMoveOrderDate",
        name: "TRANSACT MOVE ORDER DATE",
        type: "date",
      },
      { id: "transactionType", name: "TRANSACTION TYPE", type: "text" },
      { id: "employeeName", name: "EMPLOYEE", type: "text" },
    ],
  },

  moveOrder: {
    title: "Move Order Record",
    placeHolader: "Order Id...",
    company: "RDF FEED, LIVESTOCK & FOODS, INC",
    companyAddress:
      "Purok 6, Brgy Lara, City of San Fernando, Pampanga, Philippines",
    warehouse: "Warehouse FM Feeds",
    documentTitle: "RDF Feedmill Move Order Pick Slip",
    uom: "BAG", //static
    tableHeader: [
      { id: "", name: "Line" }, // static no API but must put series number thru front end
      { id: "feedCode", name: "Item Code", type: "text" },
      { id: "feedType", name: "Item Description", type: "text" },
      { id: "fgOption", name: "Category", type: "text" },
      { id: "quantity", name: "QTY", type: "numbe" },
      { id: "uom", name: "UOM", type: "text" }, //static use {info.movOrder.uom}
      { id: "", name: "Qty Actual Received", type: "text" }, // static no data in table
      { id: "binNumber", name: "BIN NO.", type: "text" },
      { id: "prodDate", name: "Prod Date", type: "date" },
      { id: "mirNo", name: "MIR", type: "text" },
    ],
  },
  consolidatedFinanceReport: {
    title: "Consolidated Report - Finance",
    placeHolader: "Account Code, Description...",
    tableHeader: [
      { id: "id", name: "ID", type: "text" },
      { id: "transactionDate", name: "TRANSACTION DATE", type: "date" },
      { id: "itemCode", name: "ITEM CODE", type: "text" },
      { id: "itemDescription", name: "ITEM DESCRIPTION", type: "text" },
      { id: "uom", name: "UOM", type: "text" },
      { id: "category", name: "CATEGORY", type: "text" },
      { id: "quantity", name: "QUANTITY", type: "number" },
      { id: "unitCost", name: "UNIT COST", type: "currency" },
      { id: "lineAmount", name: "LINE AMOUNT", type: "currency" },
      { id: "source", name: "SOURCE", type: "text" },
      { id: "transactionType", name: "TRANSACTION TYPE", type: "text" },
      { id: "reason", name: "REASON", type: "text" },
      { id: "reference", name: "REFERENCE", type: "text" },
      { id: "supplierName", name: "SUPPLIER NAME", type: "text" },
      { id: "encodedBy", name: "ENCODED BY", type: "text" },
      { id: "companyCode", name: "COMPANY CODE", type: "text" },
      { id: "companyName", name: "COMPANY NAME", type: "text" },
      { id: "departmentCode", name: "DEPARTMENT CODE", type: "text" },
      { id: "departmentName", name: "DEPARTMENT NAME", type: "text" },
      { id: "locationCode", name: "LOCATION CODE", type: "text" },
      { id: "locationName", name: "LOCATION NAME", type: "text" },
      { id: "accountTitleCode", name: "ACCOUNT TITLE CODE", type: "text" },
      { id: "accountTitle", name: "ACCOUNT TITLE", type: "text" },
      { id: "empId", name: "EMPID", type: "text" },
      { id: "fullName", name: "FULLNAME", type: "text" },
      { id: "assetTag", name: "ASSET TAG", type: "text" },
      { id: "cipNo", name: "CIP #", type: "text" },
      { id: "helpdesk", name: "HELPDESK", type: "text" },
      { id: "rush", name: "RUSH", type: "text" },
      { id: "businessUnitCode", name: "BUSINESS UNIT CODE", type: "text" },
      { id: "businessUnitName", name: "BUSINESS UNIT NAME", type: "text" },
      { id: "departmentUnitCode", name: "DEPARTMENT UNIT CODE", type: "text" },
      { id: "departmentUnitName", name: "DEPARTMENT UNIT NAME", type: "text" },
      { id: "subUnitCode", name: "SUB UNIT CODE", type: "text" },
      { id: "subUnitName", name: "SUB UNIT NAME", type: "text" },
      { id: "financialStatement", name: "FINANCIAL STATEMENT", type: "text" },
      { id: "unitResponsible", name: "UNIT RESPONSIBLE", type: "text" },
      { id: "dieselPoNo", name: "DIESEL PO#", type: "text" },
    ],
  },

  user: {
    title: "User",
    placeHolader: "Search...",
    tableHeader: [
      { id: "id", name: "ID", type: "text" },
      { id: "emplopyeeId", name: "Employee ID", type: "text" },
      { id: "fullName", name: "Name", type: "text" },
      { id: "username", name: "username", type: "text" },
      { id: "action", name: "ACTION", type: "menu" }, // for edit delete view details
    ],
    tabs: ["active", "inactive"], // fisrt time adding this, to filter user status
    served: [
      // but will now name it accordion... ps: will not include if not needed
      { id: "moveOrderDate", name: "MOVE ORDER DATE", type: "date" },
      { id: "id", name: "ID", type: "text" },
      { id: "feedCode", name: "FEED CODE", type: "text" },
      { id: "feedType", name: "FEED TYPE", type: "text" },
      { id: "fgOption", name: "FG OPTION", type: "text" },
      { id: "binNumber", name: "BIN NUMBER", type: "text" },
      { id: "quantity", name: "QUANTITY", type: "number" },
      { id: "prodDate", name: "PROD DATE", type: "date" },
      {
        id: "finishProductionDate",
        name: "FINISH PRODUCTION DATE",
        type: "date",
      },
      { id: "prodId", name: "PROD ID", type: "text" },
      { id: "plateNumber", name: "PLATE NO", type: "text" },
      { id: "status", name: "STATUS", type: "status" },
      { id: "deliveryDate", name: "DELIVERY DATE", type: "date" },
      {
        id: "transactMoveOrderDate",
        name: "TRANSACT MOVE ORDER DATE",
        type: "date",
      },
      { id: "transactionType", name: "TRANSACTION TYPE", type: "text" },
      { id: "employeeName", name: "EMPLOYEE", type: "text" },
    ],
  },

  repackingAdjustment: {
    title: "Repacking Adjustment",

    dropdownOptions: [
      { label: "Micro", value: "micro" },
      { label: "Macro", value: "macro" },
    ],

    tableHeader: [
      { id: "item_id", name: "Item ID", type: "text" }, // static no API but must put series number thru front end
      { id: "item_code", name: "Item Code", type: "text" },
      { id: "item_description", name: "Item Description", type: "text" },
      { id: "category", name: "Category", type: "text" },
      { id: "onhand", name: "SOH", type: "number" },
      { id: "reserved", name: "Reserved", type: "number" },
      {
        id: "variance",
        name: "+/-",
        type: "number",
        computed: (row) => row.onhand - row.reserved, // ← no API needed
      },
    ],
    served: [
      { id: "receivedID", name: "Received ID", type: "text" }, // static no API but must put series number thru front end
      // { id: "itemcode", name: "Item Code", type: "text" },
      // { id: "itemdescription", name: "Item Description", type: "text" },
      //{ id: "actualReceived", name: "Actual Received", type: "number" },
      { id: "actualcountgood", name: "Actual Good", type: "number" },
      { id: "r_expiry_date", name: "Expiry Date", type: "date" },
    ],
  },
  preparationAdjustment: {
    title: "Preparation Adjustment",

    tableHeader: [
      { id: "rep_id", name: "ID", type: "text" }, // static no API but must put series number thru front end
      { id: "pre_prod_id", name: "Production ID", type: "text" },
      { id: "pre_item_code", name: "Item Code", type: "text" },
      { id: "pre_description", name: "Item Description", type: "text" },
      { id: "pre_batch", name: "batch", type: "text" },
      { id: "rep_qty", name: "QTY", type: "text" },
    ],
  },
};

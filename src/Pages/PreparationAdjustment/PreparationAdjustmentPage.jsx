import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArchiveIcon from "@mui/icons-material/Archive";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import PageHeader from "../../components/headers/PageHeader";
import {
  usePaActivePreparationQuery,
  usePaItemQuery,
  usePaDeactivateMutation,
} from "../../features/api/preparationAdjustment";
import { info } from "../../schema/info";
import "../../styles/Pages/preparationAdjustment.scss";

const moduleInfo = info["preparationAdjustment"] || {};
const header = moduleInfo.tableHeader || [];

// ── Outside component to prevent remount on render ────────────────────────────

const SkeletonRows = ({ count, colCount }) =>
  Array.from({ length: count }).map((_, idx) => (
    <TableRow key={idx}>
      {Array.from({ length: colCount }).map((_, colIdx) => (
        <TableCell key={colIdx}>
          <Skeleton variant="text" width="80%" height={24} />
        </TableCell>
      ))}
    </TableRow>
  ));

const TableShell = ({
  children,
  header,
  totalCount,
  rowsPerPage,
  page,
  isFetching,
  isLoading,
  onPageChange,
  onRowsPerPageChange,
}) => (
  <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <TableContainer sx={{ flex: 1, overflow: "auto" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {header.map((col) => (
              <TableCell
                key={col.id}
                sx={{
                  backgroundColor: "#7a1515",
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                {col.name}
              </TableCell>
            ))}
            <TableCell
              sx={{
                backgroundColor: "#7a1515",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      rowsPerPageOptions={[5, 10, 25, 50]}
      component="div"
      count={totalCount}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      disabled={isFetching || isLoading}
    />
  </Box>
);

// ── Main Component ────────────────────────────────────────────────────────────

const PreparationAdjustmentPage = () => {
  const apiKey = useSelector((state) => state.auth.apiKey);

  const [selectedProdId, setSelectedProdId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);

  // ── APIs ──────────────────────────────────────────────────────────────────

  const { data: activeProductionData, isLoading: isLoadingProds } =
    usePaActivePreparationQuery({ apiKey });

  const {
    data: itemData,
    isLoading,
    isFetching,
  } = usePaItemQuery(
    {
      apiKey,
      prod_id: selectedProdId,
      usePagination: true,
      pageNumber: page + 1,
      pageSize: rowsPerPage,
    },
    { skip: !selectedProdId },
  );

  // Unpaginated — for duplicate detection across all pages
  const {
    data: allItemData,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
  } = usePaItemQuery(
    { apiKey, prod_id: selectedProdId, usePagination: false },
    { skip: !selectedProdId },
  );

  const [deactivate, { isLoading: isArchiving }] = usePaDeactivateMutation();

  // ── Derived ───────────────────────────────────────────────────────────────

  const prodIdOptions = (activeProductionData?.items ?? []).map((item) => ({
    label: `${item.prod_id}`,
    value: String(item.prod_id),
  }));

  const rows = itemData?.items ?? [];
  const totalCount = itemData?.totalCount ?? 0;

  const duplicateCodes = useMemo(() => {
    const allItems = allItemData?.items ?? [];
    const codeCount = {};
    allItems.forEach((item) => {
      codeCount[item.pre_item_code] = (codeCount[item.pre_item_code] || 0) + 1;
    });
    return new Set(
      Object.entries(codeCount)
        .filter(([, count]) => count > 1)
        .map(([code]) => code),
    );
  }, [allItemData]);

  const isDuplicate = (row) => duplicateCodes.has(row.pre_item_code);

  // Still scanning all items for duplicates
  const isScanningDuplicates = isLoadingAll || isFetchingAll;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleProdIdChange = (value) => {
    setSelectedProdId(value);
    setPage(0);
  };

  const handleMenuOpen = (event, row) => {
    setMenuAnchor(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  const handleArchive = async () => {
    if (!menuRow) return;
    handleMenuClose();
    try {
      await deactivate({
        rep_id: menuRow.rep_id.toString(),
        item_code: menuRow.pre_item_code,
      }).unwrap();
      toast.success(`Archived ${menuRow.pre_item_code} successfully`);
    } catch {
      toast.error("Failed to archive item");
    }
  };

  // ── Shared pagination props ───────────────────────────────────────────────

  const paginationProps = {
    header,
    totalCount,
    rowsPerPage,
    page,
    isFetching,
    isLoading,
    onPageChange: (_, newPage) => setPage(newPage),
    onRowsPerPageChange: (e) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      setPage(0);
    },
  };

  // ── Derived — add this ────────────────────────────────────────────
  const hasNoProductions =
    !isLoadingProds && (activeProductionData?.items ?? []).length === 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box className="preparationAdjustment">
      {/* Header */}
      <Box className="preparationAdjustment__header">
        <Box className="preparationAdjustment__header__content">
          <PageHeader title={moduleInfo.title} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              p: 1,
              gap: 2,
            }}
          >
            {/* Production ID Dropdown */}
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Production ID</InputLabel>
              {isLoadingProds ? (
                // ← Skeleton while fetching prod list
                <Skeleton
                  variant="rectangular"
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
              ) : (
                <Select
                  value={selectedProdId}
                  label="Production ID"
                  onChange={(e) => handleProdIdChange(e.target.value)}
                  disabled={hasNoProductions} // ← disabled when empty
                >
                  {prodIdOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </FormControl>

            {/* No productions indicator */}
            {hasNoProductions && (
              <Chip
                label="No active productions available"
                color="default"
                size="small"
                variant="outlined"
                sx={{ color: "text.secondary" }}
              />
            )}

            {/* Duplicate scan indicator — only show after a prod is selected */}
            {selectedProdId && isScanningDuplicates && (
              <Chip
                icon={
                  <Skeleton
                    variant="circular"
                    width={16}
                    height={16}
                    sx={{ flexShrink: 0 }}
                  />
                }
                label={<Skeleton variant="text" width={160} />}
                size="small"
                sx={{ minWidth: 200 }}
              />
            )}

            {/* Duplicate result — only show when scan is done */}
            {selectedProdId && !isScanningDuplicates && (
              <>
                {duplicateCodes.size > 0 ? (
                  <Chip
                    icon={<WarningAmberIcon />}
                    label={`${duplicateCodes.size} duplicate item code${duplicateCodes.size > 1 ? "s" : ""} detected`}
                    color="warning"
                    size="small"
                  />
                ) : (
                  <Chip
                    label="No duplicates found"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box className="preparationAdjustment__body">
        {!selectedProdId ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Typography color="text.secondary">
              Select a Production ID to view items
            </Typography>
          </Box>
        ) : isLoading ? (
          <TableShell {...paginationProps}>
            <SkeletonRows count={rowsPerPage} colCount={header.length + 1} />
          </TableShell>
        ) : rows.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Typography color="text.secondary">No data available</Typography>
          </Box>
        ) : (
          <TableShell {...paginationProps}>
            {isFetching ? (
              <SkeletonRows count={rowsPerPage} colCount={header.length + 1} />
            ) : (
              rows.map((row, idx) => {
                const dup = isDuplicate(row);
                return (
                  <TableRow
                    key={row.rep_id}
                    sx={{
                      backgroundColor: dup
                        ? "rgba(255, 152, 0, 0.12)"
                        : idx % 2 === 0
                          ? "inherit"
                          : "rgba(0,0,0,0.02)",
                      "&:hover": {
                        backgroundColor: dup
                          ? "rgba(255, 152, 0, 0.2)"
                          : "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    {header.map((col) => (
                      <TableCell key={col.id}>
                        {col.id === "pre_item_code" ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {row[col.id]}
                            {/* Show skeleton warning if still scanning */}
                            {isScanningDuplicates ? (
                              <Skeleton
                                variant="circular"
                                width={16}
                                height={16}
                              />
                            ) : (
                              dup && (
                                <Tooltip title="Duplicate item code in this production ID">
                                  <WarningAmberIcon
                                    sx={{ fontSize: 16, color: "warning.main" }}
                                  />
                                </Tooltip>
                              )
                            )}
                          </Box>
                        ) : (
                          row[col.id]
                        )}
                      </TableCell>
                    ))}

                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, row)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableShell>
        )}
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={handleArchive}
          disabled={isArchiving}
          sx={{ color: "warning.main", gap: 1 }}
        >
          <ArchiveIcon fontSize="small" />
          {isArchiving ? "Archiving..." : "Archive"}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PreparationAdjustmentPage;

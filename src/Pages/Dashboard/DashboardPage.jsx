import React, { useState } from "react";
import dayjs from "dayjs";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import {
  DASHBOARD_CARDS,
  HERO_SECONDARY_CARDS,
  HERO_SUMMARY_ITEMS,
  SUMMARY_ITEM_COLUMNS,
  HERO_CARD,
  CARD_TABLE_COLUMNS,
  STATUS_THRESHOLDS,
  POLLING_INTERVAL,
} from "../../schema/dashboardSchema";

import "../../styles/Dashboard/Dashboard.scss";
import { useProductionDashboardQuery } from "../../features/api/dashboardApi";
import PageHeader from "../../components/headers/PageHeader";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

// Resolve dot-notation path: "micro.summary.finished" → data.micro.summary.finished
const get = (obj, path, fallback = undefined) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj) ?? fallback;

const getStatusColor = (pct, theme) => {
  if (pct >= STATUS_THRESHOLDS.complete) return theme.palette.success;
  if (pct >= STATUS_THRESHOLDS.halfway) return theme.palette.warning;
  return theme.palette.error;
};

const getStatusIcon = (pct, theme) => {
  const hex = getStatusColor(pct, theme).main;
  if (pct >= STATUS_THRESHOLDS.complete)
    return <CheckCircleOutlineIcon fontSize="small" sx={{ color: hex }} />;
  if (pct >= STATUS_THRESHOLDS.halfway)
    return <HourglassEmptyIcon fontSize="small" sx={{ color: hex }} />;
  return <ErrorOutlineIcon fontSize="small" sx={{ color: hex }} />;
};

// ─────────────────────────────────────────────────────────────
// ROW STATUS CHIP
// ─────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const theme = useTheme();
  const isDone = status === "done";
  const color = isDone ? theme.palette.success.main : theme.palette.error.main;
  return (
    <Chip
      label={isDone ? "Done" : "Pending"}
      size="small"
      sx={{
        backgroundColor: `${color}18`,
        color,
        fontWeight: 700,
        fontSize: 11,
        height: 22,
        letterSpacing: 0.5,
      }}
    />
  );
};

// ─────────────────────────────────────────────────────────────
// DETAIL TABLE — shown on card expand
// ─────────────────────────────────────────────────────────────
const DetailTable = ({ rows, columns }) => {
  const cols = columns ?? CARD_TABLE_COLUMNS;
  if (!rows?.length)
    return (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ px: 2, pb: 1, display: "block" }}
      >
        No records found.
      </Typography>
    );

  return (
    <TableContainer className="fedora-dashboard__detail-table">
      <Table size="small">
        <TableHead>
          <TableRow>
            {cols.map((col) => (
              <TableCell key={col.field}>{col.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={`${row.prodId ?? row.bmxIdString ?? i}-${i}`} hover>
              {cols.map((col) => (
                <TableCell key={col.field}>
                  {col.field === "status" ? (
                    <StatusChip status={row[col.field]} />
                  ) : (
                    row[col.field]
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ─────────────────────────────────────────────────────────────
// HERO CARD — looks like a stat card, expands to show sub-cards
// ─────────────────────────────────────────────────────────────
const HeroProductionCard = ({
  data,
  open,
  onToggle,
  openSummaryKey,
  onToggleSummary,
}) => {
  const theme = useTheme();

  const summary = get(data, HERO_CARD.summaryPath, {});
  const finished = summary.finished ?? 0;
  const pending = summary.pending ?? 0;
  const total = finished + pending;
  const pct = total > 0 ? Math.round((finished / total) * 100) : 0;
  const hex = getStatusColor(pct, theme).main;

  return (
    <Card variant="outlined" className="fedora-dashboard__hero-card">
      {/* ── Clickable header — same layout as CollapsibleCard ── */}
      <CardActionArea onClick={onToggle} sx={{ borderRadius: "inherit" }}>
        <CardContent className="fedora-dashboard__card-content">
          <Stack spacing={1.5} width="100%">
            {/* Label + arrow */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography className="fedora-dashboard__hero-card-section-label">
                {HERO_CARD.label}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Tooltip title={`${pct}% complete`}>
                  {getStatusIcon(pct, theme)}
                </Tooltip>
                {open ? (
                  <KeyboardArrowUpIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                ) : (
                  <KeyboardArrowDownIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                )}
              </Stack>
            </Stack>

            {/* Counter + circular ring */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="h4"
                  className="fedora-dashboard__card-counter"
                >
                  <Box component="span" sx={{ color: hex }}>
                    {finished}
                  </Box>
                  <Box component="span" className="separator">
                    /
                  </Box>
                  <Box component="span" className="total">
                    {total}
                  </Box>
                </Typography>
                <Typography className="fedora-dashboard__card-pending">
                  {total - finished} pending
                </Typography>
              </Box>

              <Box className="fedora-dashboard__card-circular-wrapper">
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={56}
                  thickness={5}
                  sx={{
                    color: theme.palette.action.hover,
                    position: "absolute",
                  }}
                />
                <CircularProgress
                  variant="determinate"
                  value={pct}
                  size={56}
                  thickness={5}
                  sx={{ color: hex }}
                />
                <Box className="label">
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    fontSize={11}
                    sx={{ color: hex }}
                  >
                    {pct}%
                  </Typography>
                </Box>
              </Box>
            </Stack>

            {/* Progress bar */}
            <LinearProgress
              className="fedora-dashboard__card-progress-bar"
              variant="determinate"
              value={pct}
              sx={{
                backgroundColor: `${hex}22`,
                "& .MuiLinearProgress-bar": { backgroundColor: hex },
              }}
            />
          </Stack>
        </CardContent>
      </CardActionArea>

      {/* ── Collapsible: Good / Reprocess / Reject strip ── */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        {HERO_SUMMARY_ITEMS.length > 0 && (
          <Box className="fedora-dashboard__hero-summary-items">
            {HERO_SUMMARY_ITEMS.map((item) => {
              const itemData = get(data, item.itemPath, {
                total: 0,
                items: [],
              });
              const itemTotal = itemData.total ?? 0;
              const items = itemData.items ?? [];
              const isOpen = openSummaryKey === item.key;
              const isHidden = openSummaryKey !== null && !isOpen;
              const hasRows = items.length > 0;

              const itemHex =
                itemTotal > 0
                  ? item.key === "good"
                    ? theme.palette.success.main
                    : theme.palette.error.main
                  : theme.palette.action.disabled;

              return (
                <Box
                  key={item.key}
                  className="fedora-dashboard__hero-summary-item-wrapper"
                  sx={{
                    display: isHidden ? "none" : undefined,
                    flex: isOpen ? "1 1 100%" : undefined,
                  }}
                >
                  <Box
                    className={`fedora-dashboard__hero-summary-subcard ${isOpen ? "is-open" : ""}`}
                    onClick={() => hasRows && onToggleSummary(item.key)}
                    sx={{ cursor: hasRows ? "pointer" : "default" }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={0.5}
                    >
                      <Typography className="fedora-dashboard__card-label">
                        {item.label}
                      </Typography>
                      {hasRows &&
                        (isOpen ? (
                          <KeyboardArrowUpIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                        ) : (
                          <KeyboardArrowDownIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                        ))}
                    </Stack>

                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{ color: itemHex, lineHeight: 1 }}
                    >
                      {itemTotal}
                      <Box
                        component="span"
                        sx={{
                          fontSize: "0.85rem",
                          color: "text.secondary",
                          fontWeight: 400,
                          ml: 0.75,
                        }}
                      >
                        items
                      </Box>
                    </Typography>

                    <Box
                      sx={{
                        mt: 1,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: `${itemHex}22`,
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          borderRadius: 3,
                          backgroundColor: itemHex,
                          width: itemTotal > 0 ? "100%" : "0%",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </Box>
                  </Box>

                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <DetailTable rows={items} columns={SUMMARY_ITEM_COLUMNS} />
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        )}
      </Collapse>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────
// COLLAPSIBLE STAT CARD (used for both secondary + grid cards)
// ─────────────────────────────────────────────────────────────
const CollapsibleCard = ({
  label,
  finished,
  total,
  rows,
  columns,
  open,
  onToggle,
  className = "fedora-dashboard__card",
}) => {
  const theme = useTheme();
  const pct = total > 0 ? Math.round((finished / total) * 100) : 0;
  const hex = getStatusColor(pct, theme).main;
  const hasRows = rows?.length > 0;

  return (
    <Card variant="outlined" className={className}>
      {/* ── Clickable header ── */}
      <CardActionArea
        onClick={() => hasRows && onToggle()}
        disableRipple={!hasRows}
        sx={{ cursor: hasRows ? "pointer" : "default" }}
      >
        <CardContent className="fedora-dashboard__card-content">
          <Stack spacing={1.5} width="100%">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography className="fedora-dashboard__card-label">
                {label}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Tooltip title={`${pct}% complete`}>
                  {getStatusIcon(pct, theme)}
                </Tooltip>
                {hasRows &&
                  (open ? (
                    <KeyboardArrowUpIcon
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                  ) : (
                    <KeyboardArrowDownIcon
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                  ))}
              </Stack>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="h4"
                  className="fedora-dashboard__card-counter"
                >
                  <Box component="span" sx={{ color: hex }}>
                    {finished}
                  </Box>
                  <Box component="span" className="separator">
                    /
                  </Box>
                  <Box component="span" className="total">
                    {total}
                  </Box>
                </Typography>
                <Typography className="fedora-dashboard__card-pending">
                  {total - finished} pending
                </Typography>
              </Box>

              <Box className="fedora-dashboard__card-circular-wrapper">
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={56}
                  thickness={5}
                  sx={{
                    color: theme.palette.action.hover,
                    position: "absolute",
                  }}
                />
                <CircularProgress
                  variant="determinate"
                  value={pct}
                  size={56}
                  thickness={5}
                  sx={{ color: hex }}
                />
                <Box className="label">
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    fontSize={11}
                    sx={{ color: hex }}
                  >
                    {pct}%
                  </Typography>
                </Box>
              </Box>
            </Stack>

            <LinearProgress
              className="fedora-dashboard__card-progress-bar"
              variant="determinate"
              value={pct}
              sx={{
                backgroundColor: `${hex}22`,
                "& .MuiLinearProgress-bar": { backgroundColor: hex },
              }}
            />
          </Stack>
        </CardContent>
      </CardActionArea>

      {/* ── Collapsible table ── */}
      {hasRows && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <DetailTable rows={rows} columns={columns} />
        </Collapse>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────
// SKELETONS
// ─────────────────────────────────────────────────────────────
const HeroSkeleton = () => (
  <Skeleton variant="rectangular" className="fedora-dashboard__skeleton-hero" />
);

const StatCardSkeleton = () => (
  <Card variant="outlined" className="fedora-dashboard__skeleton-card">
    <CardContent>
      <Stack spacing={1.5}>
        <Skeleton width="60%" height={16} />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Skeleton width={80} height={48} />
          <Skeleton variant="circular" width={56} height={56} />
        </Stack>
        <Skeleton height={6} />
      </Stack>
    </CardContent>
  </Card>
);

// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────
const FedoraProductionDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [openKey, setOpenKey] = useState(null);
  const [openSummaryKey, setOpenSummaryKey] = useState(null);
  const [heroOpen, setHeroOpen] = useState(false); // hero expand state

  const toggleCard = (key) => setOpenKey((prev) => (prev === key ? null : key));
  const toggleSummaryCard = (key) =>
    setOpenSummaryKey((prev) => (prev === key ? null : key));
  const toggleHero = () => {
    setHeroOpen((p) => !p);
    setOpenSummaryKey(null);
  };

  const dateParam = selectedDate
    ? selectedDate.format("YYYY-MM-DD")
    : dayjs().format("YYYY-MM-DD");

  const { data, isLoading, isError } = useProductionDashboardQuery(
    { prodDate: dateParam },
    { pollingInterval: POLLING_INTERVAL },
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="fedora-dashboard">
        {/* ── Header ───────────────────────────────────── */}
        <Box className="fedora-dashboard__header">
          <Stack
            direction="row"
            alignItems="center"
            className="fedora-dashboard__header-title-row"
          >
            <PageHeader title={HERO_CARD.title} />
            <DatePicker
              label="Production Date"
              value={selectedDate}
              onChange={(val) => val && setSelectedDate(val)}
              disableFuture
              slotProps={{
                textField: {
                  size: "small",
                  className: "fedora-dashboard__datepicker",
                },
              }}
            />
          </Stack>
        </Box>

        {/* ── Error ────────────────────────────────────── */}
        {isError && (
          <Typography
            color="error"
            variant="body2"
            className="fedora-dashboard__error"
          >
            Failed to load dashboard data.
          </Typography>
        )}

        {/* ── Hero Row ─────────────────────────────────── */}
        <Grid
          container
          spacing={2}
          alignItems="stretch"
          className="fedora-dashboard__hero-row"
          mb={2}
        >
          {/* Hero card — hidden when a secondary card is expanded */}
          {(() => {
            const anySecondaryOpen = HERO_SECONDARY_CARDS.some(
              (c) => openKey === c.key,
            );
            return (
              <Grid
                size={{
                  xs: 12,
                  md: heroOpen || HERO_SECONDARY_CARDS.length === 0 ? 12 : 8,
                }}
                sx={{ display: anySecondaryOpen ? "none" : undefined }}
              >
                {isLoading || !data ? (
                  <HeroSkeleton />
                ) : (
                  <HeroProductionCard
                    data={data}
                    open={heroOpen}
                    onToggle={toggleHero}
                    openSummaryKey={openSummaryKey}
                    onToggleSummary={toggleSummaryCard}
                  />
                )}
              </Grid>
            );
          })()}

          {/* Secondary hero cards — hidden when hero is expanded */}
          {HERO_SECONDARY_CARDS.length > 0 && !heroOpen && (
            <Grid
              size={{
                xs: 12,
                md: HERO_SECONDARY_CARDS.some((c) => openKey === c.key)
                  ? 12
                  : 4,
              }}
            >
              <Stack spacing={2} sx={{ height: "100%" }}>
                {HERO_SECONDARY_CARDS.map((card) => {
                  const summary = get(data, card.summaryPath, {});
                  const finished = summary.finished ?? 0;
                  const pending = summary.pending ?? 0;
                  const rows = get(data, card.dataKey, []);
                  return isLoading || !data ? (
                    <StatCardSkeleton key={card.key} />
                  ) : (
                    <CollapsibleCard
                      key={card.key}
                      label={card.label}
                      finished={finished}
                      total={finished + pending}
                      rows={rows}
                      columns={card.columns}
                      open={openKey === card.key}
                      onToggle={() => toggleCard(card.key)}
                      className="fedora-dashboard__hero-secondary-card"
                    />
                  );
                })}
              </Stack>
            </Grid>
          )}
        </Grid>

        {/* ── Stat Cards Grid — hidden when hero is expanded ── */}
        {!heroOpen && (
          <Grid container spacing={2} className="fedora-dashboard__grid">
            {DASHBOARD_CARDS.map((card) => {
              const summary = get(data, card.summaryPath, {});
              const finished = summary.finished ?? 0;
              const pending = summary.pending ?? 0;
              const rows = get(data, card.dataKey, []);
              const isOpen = openKey === card.key;
              const isHidden = openKey !== null && !isOpen;

              return (
                <Grid
                  size={{ xs: 12, sm: isOpen ? 12 : 6, md: isOpen ? 12 : 4 }}
                  key={card.key}
                  className="fedora-dashboard__grid-item"
                  sx={{ display: isHidden ? "none" : undefined }}
                >
                  {isLoading || !data ? (
                    <StatCardSkeleton />
                  ) : (
                    <CollapsibleCard
                      label={card.label}
                      finished={finished}
                      total={finished + pending}
                      rows={rows}
                      open={isOpen}
                      onToggle={() => toggleCard(card.key)}
                    />
                  )}
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default FedoraProductionDashboard;

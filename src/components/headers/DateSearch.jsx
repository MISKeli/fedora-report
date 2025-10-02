/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useRef, useState, useEffect } from "react";
import {
  SearchRounded,
  ClearRounded,
  CalendarTodayRounded,
} from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import useDebounce from "../../hooks/useDebounce";
import { info } from "../../schema/info";

const DateSearch = ({
  setReportData,
  onSearchChange,
  searchValue = "",
  searchPlaceHolder = "Search...",
  updateQueryParams = false,
  initialDate = null,
  hasDatePicker = true,
}) => {
  const theme = useTheme();
  const currentDate = moment();
  const [currentParams, setQueryParams] = useRememberQueryParams();

  // Search state
  const inputRef = useRef(null);
  const [search, setSearch] = useState(searchValue || "");
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Date state
  const [startDate, setStartDate] = useState(() => {
    if (initialDate) return moment(initialDate);
    return currentDate.clone();
  });

  const [endDate, setEndDate] = useState(() => {
    if (initialDate) return moment(initialDate);
    return currentDate.clone();
  });

  const [loading, setLoading] = useState(false);

  // Debounced search
  const debouncedSearch = useDebounce(search, 300);

  // Update search value when prop changes
  useEffect(() => {
    setSearch(searchValue || "");
    if (searchValue) {
      setSearchExpanded(true);
    }
  }, [searchValue]);

  // Initialize search from query params (run only once)
  useEffect(() => {
    if (updateQueryParams && currentParams.s && !searchValue && !search) {
      const paramValue = currentParams.s;
      setSearch(paramValue);
      if (onSearchChange) {
        onSearchChange(paramValue);
      }
    }
  }, []);

  // Update dates when initialDate changes
  useEffect(() => {
    if (initialDate && moment(initialDate).isValid()) {
      const newDate = moment(initialDate);
      setStartDate(newDate.clone());
      setEndDate(newDate.clone());
    }
  }, [initialDate?.valueOf()]);

  // Handle debounced search changes
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange]);

  // Update query parameters for search (separate effect)
  useEffect(() => {
    if (updateQueryParams) {
      setQueryParams(
        {
          s: debouncedSearch || undefined,
        },
        { retain: true }
      );
    }
  }, [debouncedSearch, updateQueryParams]);

  // Search handlers
  const handleSearchFocus = () => {
    setSearchExpanded(true);
    inputRef.current?.focus();
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchClear = () => {
    setSearch("");
    if (onSearchChange) {
      onSearchChange("");
    }
    inputRef.current?.focus();
  };

  const handleSearchBlur = () => {
    if (!search.trim()) {
      setSearchExpanded(false);
    }
  };

  // Date handlers
  const handleFromDateChange = (selectedDate) => {
    const newFromDate = moment(selectedDate);
    setStartDate(newFromDate);

    // Adjust toDate if it's before the new fromDate
    if (endDate.isBefore(newFromDate, "day")) {
      setEndDate(newFromDate.clone());
    }
  };

  const handleToDateChange = (selectedDate) => {
    setEndDate(moment(selectedDate));
  };

  // Submit handler - only for dates
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const reportData = {
        startDate: startDate.format(info.format.date),
        endDate: endDate.format(info.format.date),
      };

      // Update query parameters if enabled
      if (updateQueryParams) {
        setQueryParams(
          {
            fd: startDate.format(info.format.date),
            td: endDate.format(info.format.date),
          },
          { retain: true }
        );
      }

      await setReportData(reportData);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = () => {
    if (loading) return true;
    if (hasDatePicker && endDate.isBefore(startDate, "day")) return true;
    return false;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box
        className="date-search-container"
        sx={{
      //backgroundColor:"pink",
          display: "flex",
          alignItems: "center", // allow labels to float fully
          justifyContent: "space-between",
          gap: 2,
          p: 1,
          overflowX: "auto", // only scroll sideways
          overflowY: "visible", // allow labels to render fully
          "&::-webkit-scrollbar": {
            height: 6,
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#ccc",
            borderRadius: 3,
          },
        }}
      >
        {/* Scrollable section */}
       
        

          {/* Date Range Pickers */}
          {hasDatePicker && (
            <>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={handleFromDateChange}
                slotProps={{
                  textField: {
                    variant: "outlined",
                    size: "small",
                    sx: { minWidth: 160, flexShrink: 0 },
                  },
                }}
              />

              <DatePicker
                label="End Date"
                value={endDate}
                onChange={handleToDateChange}
                minDate={startDate}
                slotProps={{
                  textField: {
                    variant: "outlined",
                    size: "small",
                    sx: { minWidth: 160, flexShrink: 0 },
                  },
                }}
              />
            </>
          )}
       
        {/* Fixed Button (always visible) */}
        {hasDatePicker && setReportData && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitDisabled()}
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CalendarTodayRounded />
              )
            }
            sx={{
              minWidth: 120,
              height: 40,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(25, 118, 210, 0.2)",
              flexShrink: 0, // prevents shrinking
              "&:hover": {
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              },
              "&:disabled": {
                backgroundColor: "#e0e0e0",
                color: "#999",
              },
            }}
          >
            {loading ? "Loading..." : "Generate"}
          </Button>
       
       )}
     {hasDatePicker && setReportData && (  <Divider orientation="vertical" variant="middle" flexItem />)}
        
          {/* Search */}
          <Box sx={{ position: "relative", flexShrink: 0 }}>
            <InputBase
              ref={inputRef}
              placeholder={searchPlaceHolder}
              value={search}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              startAdornment={
                <IconButton
                  onClick={handleSearchFocus}
                  sx={{
                    color: searchExpanded ? theme.palette.primary.main : "#666",
                    transition: "color 0.3s ease",
                    p: 1,
                  }}
                >
                  <SearchRounded sx={{ zIndex: "1" }} />
                </IconButton>
              }
              endAdornment={
                search && (
                  <IconButton
                    onClick={handleSearchClear}
                    size="small"
                    sx={{
                      color: "#666",
                      mr: 1,
                      "&:hover": { color: theme.palette.primary.main },
                    }}
                  >
                    <ClearRounded fontSize="small" />
                  </IconButton>
                )
              }
              sx={{
                minWidth: 300,
                height: 40,
                px: 0,
                border: "1px solid #c4c4c4",
                borderRadius: 1,
                backgroundColor: theme.palette.background.paper,
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "#000",
                },
                "&:focus-within": {
                  borderColor: theme.palette.primary.dark,
                  borderWidth: "2px",
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                top: -8,
                left: 12,
                backgroundColor: theme.palette.background.paper,
                px: 0.5,
                color: searchExpanded ? theme.palette.primary.main : "#666",
                fontSize: "0.75rem",
                transition: "color 0.3s ease",
              }}
            >
              Search
            </Typography>
          </Box>
      </Box>
    </LocalizationProvider>

  );
};

export default DateSearch;

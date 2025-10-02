import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import React from "react";
import { paletteSchema } from "../schema/paletteSchema";

const ProvidesTheme = ({ children }) => {
  const theme = createTheme({
    palette: { ...paletteSchema },

    typography: {
      fontFamily: "Inter, sans-serif",
    },

    components: {
      // Enhanced Table Container for floating effect
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.12)",
            border: `1px solid ${
              paletteSchema.divider || "rgba(0, 0, 0, 0.12)"
            }`,
            backgroundColor: "#ffffff",
            overflow: "hidden", // Ensures border radius is respected
            margin: " 0 0 16px 0",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
        },
      },

      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: "separate",
            borderSpacing: 0,
            width: "100%", // Ensure table takes full width
            tableLayout: "auto", // Let columns size naturally based on content
        
            "& .MuiTableCell-root": {
              borderBottom: `1px solid ${
                paletteSchema.divider || "rgba(0, 0, 0, 0.08)"
              }`,
            },
          },
        },
      },

      // Enhanced Table Head
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableRow-root": {
              "& .MuiTableCell-root": {
                borderColor: paletteSchema.primary.main,
                whiteSpace: "nowrap",
                backgroundColor: paletteSchema.primary.main,
                fontWeight: 600,
                color: paletteSchema.primary.contrastText,
                borderBottom: "none",
                borderRight: `1px solid ${
                  paletteSchema.primary.dark || paletteSchema.primary.main
                }`,
                
                padding: "12px 16px", // Consistent padding
                fontSize: "0.875rem",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                position: "sticky",
                top: 0,
                zIndex: 100,
                width: "auto", // Let width be determined by content
                minWidth: "120px", // Set minimum width for readability

                // Remove border from last cell
                "&:last-child": {
                  borderRight: "none",
                },

                // Add subtle gradient
                background: `linear-gradient(135deg, ${
                  paletteSchema.primary.main
                } 0%, ${
                  paletteSchema.primary.dark || paletteSchema.primary.main
                } 100%)`,
              },
            },
          },
        },
      },

      // Enhanced Table Cells
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderRight: `1px solid ${
              paletteSchema.divider || "rgba(0, 0, 0, 0.06)"
            }`,
            padding: "12px 16px",
            fontSize: "0.875rem",

            width: "auto", // Let width be auto-sized
            height: "auto", // CRITICAL: Let height be auto-sized based on content
            minWidth: "100px", // Minimum width for readability
            maxWidth: "300px", // Prevent cells from becoming too wide
            overflow: "hidden",
            textOverflow: "ellipsis",
            verticalAlign: "middle",
            boxSizing: "border-box", // Ensure padding is included in dimensions

            // Ensure proper sizing behavior
            "&.MuiTableCell-head": {
              position: "sticky",
              top: 0,
              zIndex: 100,
              width: "auto",
              height: "auto", // Let header cells size naturally
              minWidth: "120px",
              minHeight: "48px", // Set minimum height for header consistency
            },

            "&.MuiTableCell-body": {
              width: "auto",
              height: "auto", // CRITICAL: Let body cells size based on content
              minHeight: "40px", // Minimum height for body cells
              maxHeight: "none", // Don't limit max height
              // Allow wrapping for longer content in body cells
              whiteSpace: "normal",
              wordBreak: "break-word",
            },

            // Special handling for numeric columns
            "&[data-type='number']": {
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
              minWidth: "80px",
            },

            // Special handling for date columns
            "&[data-type='date']": {
              minWidth: "120px",
              whiteSpace: "nowrap",
            },

            "&:last-child": {
              borderRight: "none",
            },
          },
        },
      },

      // Enhanced Table Body
      MuiTableBody: {
        styleOverrides: {
          root: {
            "& .MuiTableRow-root": {
              transition: "all 0.3s ease",
              borderRadius: 0,

              "&:hover": {
                backgroundColor:
                  paletteSchema.action?.hover || "rgba(25, 118, 210, 0.04)",
                transform: "scale(1.002)",
              },

              // "&:last-child": {
              //   "& .MuiTableCell-root": {
              //     borderBottom: "none",
              //   },
              // },

              "& .MuiTableCell-root": {
                whiteSpace: "nowrap",
                borderBottom: `1px solid ${
                  paletteSchema.divider || "rgba(0, 0, 0, 0.06)"
                }`,

                // Add subtle animation on cell content
                "& > *": {
                  transition: "color 0.2s ease",
                },
              },
            },
          },
        },
      },

      // Enhanced Table Row for better interaction
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              backgroundColor:
                paletteSchema.primary.light || "rgba(25, 118, 210, 0.08)",

              "&:hover": {
                backgroundColor:
                  paletteSchema.primary.light || "rgba(25, 118, 210, 0.12)",
              },
            },
          },
        },
      },

      // Enhanced Pagination (if you use it)
      MuiTablePagination: {
        styleOverrides: {
          root: {
            overflow: "hidden",
            borderTop: `1px solid ${
              paletteSchema.divider || "rgba(0, 0, 0, 0.06)"
            }`,
            backgroundColor: paletteSchema.background?.paper || "#fafafa",

            "& .MuiTablePagination-toolbar": {
              //padding: " 4px",
              heigth:"50px"
            },

            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontSize: "0.875rem",
                color: paletteSchema.text?.secondary || "rgba(0, 0, 0, 0.6)",
              },

            "& .MuiIconButton-root": {
              borderRadius: 8,
              transition: "all 0.2s ease",

              "&:hover": {
                backgroundColor:
                  paletteSchema.action?.hover || "rgba(25, 118, 210, 0.08)",
                transform: "scale(1.1)",
              },
            },
          },
        },
      },

      // Original SVG Icon styles
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            fontSize: "1.5rem",
          },
          fontSizeSmall: {
            fontSize: "1rem",
          },
          fontSizeLarge: {
            fontSize: "2.5rem",
          },
        },
      },

      // Enhanced Paper component for consistency
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            border: `1px solid ${
              paletteSchema.divider || "rgba(0, 0, 0, 0.06)"
            }`,
          },
          elevation1: {
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          },
          elevation2: {
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
          },
        },
      },

      // Enhanced Button styles for table actions
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 600,
            transition: "all 0.2s ease",

            "&:hover": {
              transform: "translateY(-1px)",
            },
          },
        },
      },

      // Enhanced Chip styles (often used in tables)
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            fontWeight: 500,
            fontSize: "0.75rem",
            transition: "all 0.2s ease",

            "&:hover": {
              transform: "scale(1.05)",
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default ProvidesTheme;

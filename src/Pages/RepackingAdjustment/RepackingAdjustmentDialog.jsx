// RepackingAdjustmentDialog.jsx
import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { toast } from "sonner";
import { useRmMUpdateActualMutation } from "../../features/api/repackingAdjustmentApi";

/**
 * RepackingAdjustmentDialog
 *
 * @param {boolean}  open       - Dialog visibility
 * @param {function} onClose    - Close handler
 * @param {object}   detailRow  - The clicked detail row ({ receivedID, ... })
 * @param {object}   parentRow  - The parent accordion row ({ onhand, ... })
 */
const RepackingAdjustmentDialog = ({
  open,
  onClose,
  detailRow = {},
  parentRow = {},
}) => {
  const [onhandValue, setOnhandValue] = useState("");
  const [error, setError] = useState("");

  const [updateActual, { isLoading }] = useRmMUpdateActualMutation();

  // Pre-fill onhand whenever dialog opens
  useEffect(() => {
    if (open) {
      setOnhandValue(parentRow?.onhand ?? "");
      setError("");
    }
  }, [open, parentRow]);

  const handleOnhandChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d*\.?\d*$/.test(val) && Number(val) >= 0)) {
      setOnhandValue(val);
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (onhandValue === "" || isNaN(Number(onhandValue))) {
      setError("Please enter a valid quantity.");
      return;
    }

    try {
      await updateActual({
        received_id: detailRow?.receivedID,
        total_good: Number(onhandValue),
      }).unwrap();

      toast.success("Adjustment saved successfully.");
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save adjustment.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 3,
          py: 2,
          backgroundColor: "background.header",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Inventory2OutlinedIcon sx={{ color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Repacking Adjustment
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={isLoading}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* Received ID */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            RECEIVED ID
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip
              label={detailRow?.receivedID ?? "—"}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 700, fontSize: "0.85rem", px: 1 }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Editable SOH → maps to total_good in payload */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              letterSpacing: 0.5,
              display: "block",
              mb: 1,
            }}
          >
            STOCK ON HAND (EDITABLE)
          </Typography>
          <TextField
            fullWidth
            value={onhandValue}
            onChange={handleOnhandChange}
            error={!!error}
            helperText={error || `Original value: ${parentRow?.onhand ?? "—"}`}
            variant="outlined"
            size="small"
            inputProps={{ inputMode: "decimal" }}
            disabled={isLoading}
            sx={{ maxWidth: 220 }}
          />
        </Box>
      </DialogContent>

      <Divider />

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          variant="outlined"
          size="medium"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="medium"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Confirm Adjustment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RepackingAdjustmentDialog;

import { Box, Chip, Select, MenuItem, Stack, Typography } from "@mui/material";
import { useState } from "react";

const statusConfig = {
  brainstorm: {
    label: "💡 Brainstorm",
    color: "#FFB366",
    bgColor: "#FFF3E0",
    description: "Initial idea phase",
  },
  planning: {
    label: "📋 Planning",
    color: "#42A5F5",
    bgColor: "#E3F2FD",
    description: "Planning phase",
  },
  "in-progress": {
    label: "🚀 In Progress",
    color: "#66BB6A",
    bgColor: "#E8F5E9",
    description: "Currently being worked on",
  },
  completed: {
    label: "✅ Completed",
    color: "#29B6F6",
    bgColor: "#E0F2F1",
    description: "Idea completed",
  },
  archived: {
    label: "📦 Archived",
    color: "#A1887F",
    bgColor: "#EFEBE9",
    description: "Archived idea",
  },
};

const IdeaStatus = ({ currentStatus, onStatusChange, isAuthor = false }) => {
  const status = statusConfig[currentStatus] || statusConfig.brainstorm;

  if (!isAuthor) {
    return (
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="caption" sx={{ fontWeight: "bold", color: "gray" }}>
            Idea Status:
          </Typography>
          <Chip
            label={status.label}
            sx={{
              backgroundColor: status.bgColor,
              color: status.color,
              fontWeight: "bold",
              border: `2px solid ${status.color}`,
            }}
          />
          <Typography variant="caption" sx={{ color: "gray", fontSize: "0.75rem" }}>
            {status.description}
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mb: 2,
        p: 1.5,
        backgroundColor: status.bgColor,
        borderRadius: 1,
        border: `2px solid ${status.color}`,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
            Update Idea Status
          </Typography>
          <Typography variant="caption" sx={{ color: "gray", fontSize: "0.75rem" }}>
            Track the progress of this idea
          </Typography>
        </Box>

        <Select
          value={currentStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          size="small"
          sx={{
            backgroundColor: "white",
            borderColor: status.color,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: status.color,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: status.color,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: status.color,
            },
          }}
        >
          <MenuItem value="brainstorm">💡 Brainstorm</MenuItem>
          <MenuItem value="planning">📋 Planning</MenuItem>
          <MenuItem value="in-progress">🚀 In Progress</MenuItem>
          <MenuItem value="completed">✅ Completed</MenuItem>
          <MenuItem value="archived">📦 Archived</MenuItem>
        </Select>
      </Stack>
    </Box>
  );
};

export default IdeaStatus;

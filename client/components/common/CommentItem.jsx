import { Box, Avatar, Typography, Stack, Chip, Paper } from "@mui/material";
import { format } from "date-fns";

const CommentItem = ({ comment, author, mentionedUsers = [] }) => {
  const renderCommentWithMentions = () => {
    let text = comment.comment;
    const parts = [];
    let lastIndex = 0;

    // Find all @mentions in the text
    const mentionRegex = /@(\w+)/g;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }

      // Add mention
      const mentionedUser = mentionedUsers.find((u) => u.name === match[1]);
      parts.push({
        type: "mention",
        content: match[0],
        userId: mentionedUser?._id,
        userName: match[1],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex),
      });
    }

    return parts.map((part, index) => {
      if (part.type === "mention") {
        return (
          <Chip
            key={index}
            label={part.content}
            size="small"
            sx={{
              backgroundColor: "#59e3a7",
              color: "white",
              fontWeight: "bold",
              mx: 0.5,
              display: "inline-flex",
            }}
          />
        );
      }
      return <span key={index}>{part.content}</span>;
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: "#fafafa",
        borderLeft: "3px solid #59e3a7",
      }}
    >
      <Stack direction="row" spacing={2}>
        <Avatar
          src={author?.profile_picture}
          alt={author?.name}
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {author?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "gray" }}>
              {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
            </Typography>
          </Stack>

          <Box
            sx={{
              p: 1.5,
              backgroundColor: "white",
              borderRadius: 1,
              mb: 1,
            }}
          >
            <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
              {renderCommentWithMentions()}
            </Typography>
          </Box>

          {/* Show mentioned users */}
          {comment.mentions && comment.mentions.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", mt: 1 }}>
              <Typography variant="caption" sx={{ color: "gray" }}>
                Mentioned:
              </Typography>
              {comment.mentions.map((mention, index) => (
                <Chip
                  key={index}
                  label={mention.name || mention}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: "0.75rem",
                    borderColor: "#59e3a7",
                    color: "#59e3a7",
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default CommentItem;

import { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  Chip,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import Cookies from "js-cookie";

const CommentBox = ({
  onCommentSubmit,
  currentUser,
  postAuthor,
  users = [],
}) => {
  const [commentText, setCommentText] = useState("");
  const [mentions, setMentions] = useState([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const textFieldRef = useRef(null);

  // Handle mention trigger (@)
  const handleCommentChange = (e) => {
    const text = e.target.value;
    setCommentText(text);

    // Detect @ mention
    const lastAtIndex = text.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const afterAt = text.substring(lastAtIndex + 1);
      // Only show suggestions if @ is followed by text without space
      if (!afterAt.includes(" ")) {
        setMentionQuery(afterAt);
        const filtered = users.filter(
          (user) =>
            user.name?.toLowerCase().includes(afterAt.toLowerCase()) &&
            !mentions.find((m) => m._id === user._id)
        );
        setFilteredUsers(filtered);
        setShowMentionSuggestions(filtered.length > 0);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  // Add mention
  const handleAddMention = (user) => {
    if (!mentions.find((m) => m._id === user._id)) {
      setMentions([...mentions, user]);
      // Replace @query with @username
      const lastAtIndex = commentText.lastIndexOf("@");
      const newText =
        commentText.substring(0, lastAtIndex) +
        "@" +
        user.name +
        " " +
        commentText.substring(lastAtIndex + mentionQuery.length + 1);
      setCommentText(newText);
    }
    setShowMentionSuggestions(false);
  };

  // Remove mention
  const handleRemoveMention = (userId) => {
    setMentions(mentions.filter((m) => m._id !== userId));
  };

  // Submit comment
  const handleSubmitComment = async () => {
    if (commentText.trim()) {
      const mentionIds = mentions.map((m) => m._id);
      await onCommentSubmit({
        comment: commentText,
        mentions: mentionIds,
      });
      setCommentText("");
      setMentions([]);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Avatar
            src={currentUser?.profile_picture}
            alt={currentUser?.name}
            sx={{ width: 40, height: 40 }}
          />
          <Box sx={{ flex: 1 }}>
            {/* Mentions Display */}
            {mentions.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 1, flexWrap: "wrap" }}
              >
                {mentions.map((mention) => (
                  <Chip
                    key={mention._id}
                    label={mention.name}
                    onDelete={() => handleRemoveMention(mention._id)}
                    size="small"
                    sx={{
                      backgroundColor: "#59e3a7",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                ))}
              </Stack>
            )}

            {/* Text Field */}
            <Box sx={{ position: "relative" }}>
              <TextField
                ref={textFieldRef}
                fullWidth
                multiline
                maxRows={4}
                minRows={3}
                placeholder="Share your thoughts and ideas... (Type @ to mention someone)"
                value={commentText}
                onChange={handleCommentChange}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                  },
                }}
              />

              {/* Mention Suggestions */}
              {showMentionSuggestions && filteredUsers.length > 0 && (
                <Paper
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    maxHeight: 300,
                    overflowY: "auto",
                    zIndex: 10,
                    mt: 0.5,
                  }}
                >
                  <List sx={{ py: 0 }}>
                    {filteredUsers.map((user) => (
                      <ListItemButton
                        key={user._id}
                        onClick={() => handleAddMention(user)}
                        sx={{
                          "&:hover": {
                            backgroundColor: "#f0f0f0",
                          },
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar
                            src={user.profile_picture}
                            alt={user.name}
                            sx={{ width: 32, height: 32 }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.name}
                          secondary={user.email}
                          primaryTypographyProps={{ variant: "body2" }}
                          secondaryTypographyProps={{ variant: "caption" }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                sx={{
                  backgroundColor: "#59e3a7",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#3fb882",
                  },
                  "&:disabled": {
                    backgroundColor: "#ccc",
                  },
                }}
              >
                Comment
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CommentBox;

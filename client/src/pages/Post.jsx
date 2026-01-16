import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  ThumbUp,
  Favorite,
  SentimentVeryDissatisfied,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
  Print,
} from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Avatar,
  Box,
  Stack,
} from "@mui/material";
import useThinkify from "../hooks/useThinkify";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import CommentBox from "../../components/common/CommentBox";
import CommentItem from "../../components/common/CommentItem";

import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
} from "react-share";
import { marked } from "marked";
import DOMPurify from "dompurify";

const reactionsList = [
  { type: "like", icon: <ThumbUp />, color: "primary" },
  { type: "love", icon: <Favorite />, color: "error" },
  { type: "angry", icon: <SentimentVeryDissatisfied />, color: "warning" },
];

const Post = () => {
  const { postId } = useParams();
  const shareUrl = `https://thinkify.vercel.app/posts/${postId}`;
  const {
    setLoadingStatus,
    setAlertBoxOpenStatus,
    setAlertSeverity,
    setAlertMessage,
  } = useThinkify();
  const [post, setPost] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const cardRef = useRef();

  const renderMarkdown = (description) => {
    const html = marked(description);
    return { __html: DOMPurify.sanitize(html) };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStatus(true);
      try {
        // Fetch post
        const postResponse = await axios.get(
          `${import.meta.env.VITE_SERVER_ENDPOINT}/posts/${postId}`
        );
        if (postResponse.data.status) {
          setPost(postResponse.data.post);
        }

        // Fetch users for mentions
        try {
          const usersResponse = await axios.get(
            `${import.meta.env.VITE_SERVER_ENDPOINT}/users/search/mention`,
            {
              headers: {
                Authorization: `Bearer ${Cookies.get(
                  import.meta.env.VITE_TOKEN_KEY
                )}`,
              },
            }
          );
          if (usersResponse.data.status && usersResponse.data.users) {
            setUsers(usersResponse.data.users);
          }
        } catch (err) {
          console.warn("Could not fetch users for mentions");
        }

        // Fetch current user
        const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
        if (token) {
          try {
            const decoded = jwtDecode(token);
            const userResponse = await axios.get(
              `${import.meta.env.VITE_SERVER_ENDPOINT}/users/profile`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (userResponse.data.status) {
              setCurrentUser(userResponse.data.user);
            }
          } catch (err) {
            console.warn("Could not fetch current user");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAlertBoxOpenStatus(true);
        setAlertSeverity("error");
        setAlertMessage("Something Went Wrong");
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchData();
  }, [postId]);

  const handleCommentSubmit = async (commentData) => {
    try {
      setLoadingStatus(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/posts/${postId}/comment`,
        commentData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(
              import.meta.env.VITE_TOKEN_KEY
            )}`,
          },
        }
      );

      if (response.data.status) {
        setPost((prevPost) => {
          return {
            ...prevPost,
            comments: [
              ...prevPost.comments,
              {
                comment: commentData.comment,
                mentions: commentData.mentions || [],
                userId: currentUser?._id,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        });
        setAlertBoxOpenStatus(true);
        setAlertSeverity("success");
        setAlertMessage(response.data.message);
      } else {
        setAlertBoxOpenStatus(true);
        setAlertSeverity("error");
        setAlertMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage(
        error.response?.data?.message || "Failed to add comment"
      );
    } finally {
      setLoadingStatus(false);
    }
  };
    }
  };

  const handleReact = async (reactionType) => {
    if (reactionsList.find((reaction) => reaction.type === reactionType)) {
      const fetchData = async () => {
        setLoadingStatus(true);
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_SERVER_ENDPOINT}/posts/${postId}/reaction`,
            {
              reactionType: reactionType,
            },
            {
              headers: {
                Authorization: `Bearer ${Cookies.get(
                  import.meta.env.VITE_TOKEN_KEY
                )}`,
              },
            }
          );
          if (response.data.status) {
            setPost((prevPost) => {
              const authorizedUser = jwtDecode(
                Cookies.get(import.meta.env.VITE_TOKEN_KEY)
              ).userId;
              const userReaction = prevPost.reactions.find(
                (r) => r.reactor_id === authorizedUser
              );

              if (!userReaction) {
                return {
                  ...prevPost,
                  reactions: [
                    ...prevPost.reactions,
                    {
                      reactor_id: authorizedUser,
                      reaction: reactionType,
                    },
                  ],
                };
              } else if (userReaction.reaction === reactionType) {
                return {
                  ...prevPost,
                  reactions: prevPost.reactions.filter(
                    (r) => r.reactor_id !== authorizedUser
                  ),
                };
              } else {
                return {
                  ...prevPost,
                  reactions: prevPost.reactions.map((r) =>
                    r.reactor_id === authorizedUser
                      ? { ...r, reaction: reactionType }
                      : r
                  ),
                };
              }
            });

            setAlertBoxOpenStatus(true);
            setAlertSeverity("success");
            setAlertMessage(response.data.message);
          } else {
            setLoadingStatus(false);
            setAlertBoxOpenStatus(true);
            setAlertSeverity(response.data.status ? "success" : "error");
            setAlertMessage(response.data.message);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoadingStatus(false);
          setAlertBoxOpenStatus(true);
          setAlertSeverity("error");
          setAlertMessage("Something Went Wrong");
          error.response.data.message
            ? setAlertMessage(error.response.data.message)
            : setAlertMessage(error.message);
        } finally {
          setLoadingStatus(false);
        }
      };
      fetchData();
    } else {
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage("Reaction Required");
    }
  };

  const cardRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => cardRef.current,
    documentTitle: post?.title || "Post Print",
    removeAfterPrint: true,
    contentRef: cardRef,
  });

  return (
    <>
      <Card
        ref={cardRef}
        sx={{ maxWidth: 1280, margin: "20px auto", padding: 2 }}
      >
    {
      post?
      <CardContent>
      {post && (
        <Typography
          sx={{ color: "#1b2e35" }}
          variant="h3"
          fontWeight={"bold"}
          gutterBottom
        >
          {post.title}
        </Typography>
      )}
      <Typography variant="subtitle2" color="text.secondary">
        {post && `Author: ${post.author}`}
        {post &&
          post.createdAt !== null &&
          ` | ${new Date(post.createdAt).toLocaleString()}`}
      </Typography>

      {post && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ marginTop: 1 }}
          className="no-print"
        >
          <FacebookShareButton url={shareUrl} quote={post.title}>
            <Facebook
              sx={{ fontSize: 30, cursor: "pointer", color: "#1877F2" }}
            />
          </FacebookShareButton>

          <TwitterShareButton url={shareUrl} title={post.title}>
            <Twitter
              sx={{ fontSize: 30, cursor: "pointer", color: "#1DA1F2" }}
            />
          </TwitterShareButton>

          <LinkedinShareButton
            url={shareUrl}
            title={post.title}
            source={shareUrl}
          >
            <LinkedIn
              sx={{ fontSize: 30, cursor: "pointer", color: "#0077B5" }}
            />
          </LinkedinShareButton>

          <WhatsappShareButton
            url={shareUrl}
            title={post.title}
            separator=" - "
          >
            <WhatsApp
              sx={{ fontSize: 30, cursor: "pointer", color: "#25D366" }}
            />
          </WhatsappShareButton>

          <Print
            onClick={handlePrint}
            sx={{ fontSize: 30, cursor: "pointer", color: "#333333" }}
          />
        </Stack>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 1 }}>
        {post &&
          post.tags.map((tag, index) => (
            <Chip
              key={index}
              label={`#${tag}`}
              color="info"
              variant="outlined"
              sx={{
                cursor: "pointer",
                borderColor: "#1b2e35",
                color: "#1b2e35",
              }}
            />
          ))}
      </Stack>

      {post && (
        <Typography
          variant="body1"
          paragraph
          my={4}
          dangerouslySetInnerHTML={renderMarkdown(post.description)}
        />
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        {post &&
          reactionsList.map((reaction) => (
            <Button
              key={reaction.type}
              variant="contained"
              color={reaction.color}
              startIcon={reaction.icon}
              onClick={() => handleReact(reaction.type)}
            >
              {
                post.reactions.filter((r) => r.reaction === reaction.type)
                  .length
              }
            </Button>
          ))}
      </Stack>

      {post && (
        <Box sx={{ mt: 3 }} className="no-print">
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            💬 Idea Collaboration & Comments
          </Typography>

          {currentUser && (
            <CommentBox
              onCommentSubmit={handleCommentSubmit}
              currentUser={currentUser}
              postAuthor={post.author}
              users={users}
            />
          )}

          {post.comments && post.comments.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                {post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}
              </Typography>
              {post.comments.map((comment, index) => {
                const commentAuthor = users.find(
                  (u) => u._id === comment.userId
                );
                const mentionedUsers = comment.mentions
                  ? comment.mentions.map((mentionId) =>
                      users.find((u) => u._id === mentionId)
                    )
                  : [];

                return (
                  <CommentItem
                    key={index}
                    comment={comment}
                    author={commentAuthor}
                    mentionedUsers={mentionedUsers}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      )}
    </CardContent>:
    <CardContent>
        <Box textAlign="center" mt={5}>
        <Typography variant="h4" color="#1b2e35">
          Post Not Available
        </Typography>
      </Box>
    </CardContent>
    }
      </Card>
    </>
  );
};

export default Post;

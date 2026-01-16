import {
  Box,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";

import SimpleMdeReact from "react-simplemde-editor";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "easymde/dist/easymde.min.css";
import useThinkify from "../hooks/useThinkify";
import axios from "axios";
import Cookies from "js-cookie";

const AddPost = () => {
  const {
    setLoadingStatus,
    setAlertBoxOpenStatus,
    setAlertMessage,
    setAlertSeverity,
  } = useThinkify();
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    reset,
  } = useForm();
  const [description, setDescription] = useState("");
  
  

  const renderMarkdown = () => {
    const html = marked(description);
    return { __html: DOMPurify.sanitize(html) };
  };

  const onSubmit = async (data) => {
    const trimmedDescription = description.trim();
    if (trimmedDescription.length === 0) {
      setError("description", {
        type: "manual",
        message: "Description is required",
      });
      return;
    }

    try {
      setLoadingStatus(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/posts`,
        {
          title: data.title,
          description: trimmedDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get(import.meta.env.VITE_TOKEN_KEY)}`,
          },
        }
      );
      
      if (response.data.status) {
        reset();
        setDescription("");
      }
      setLoadingStatus(false);
      setAlertBoxOpenStatus(true);
      setAlertSeverity(response.data.status ? "success" : "error");
      setAlertMessage(response.data.message);
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

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", gap: "10px" }}>
            <Box sx={{ flex: "1" }}>
              <Box>
                <label
                  htmlFor="title"
                  style={{ fontSize: "25px", fontWeight: "bold" }}
                >
                  Title
                </label>
                <TextField
                  placeholder="Enter Post Title"
                  fullWidth
                  {...register("title", { required: "Title is required" })}
                  error={!!errors.title}
                  helperText={errors.title ? errors.title.message : ""}
                />
              </Box>

              <div dangerouslySetInnerHTML={renderMarkdown()} />
            </Box>

            <Box sx={{ flex: "1" }}>
              <Box>
                <label
                  htmlFor="description"
                  style={{ fontSize: "25px", fontWeight: "bold" }}
                >
                  Description
                </label>
                <SimpleMdeReact
                  id="description"
                  value={description}
                  onChange={setDescription}
                />
              </Box>
              {errors.description && (
                <Typography color="error" variant="body2">
                  {errors.description.message}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              color: "white",
              backgroundColor: "#59e3a7",
              "&:hover": { backgroundColor: "#59e3a7" },
            }}
          >
            Post
          </Button>
        </form>
      </Box>
    </>
  );
};

export default AddPost;

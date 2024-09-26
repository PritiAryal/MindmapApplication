import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";
import { v4 as uuidv4 } from "uuid";
import "../styles/ManageVideo.css";

const AddVideo = ({ nodeId, onClose }) => {
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({ id: "", title: "", url: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, [nodeId]);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/node/${nodeId}/video`);
      setVideos(response.data);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateFields = () => {
    let errors = {};
    if (!newVideo.title.trim()) errors.title = "Title is required";
    if (!newVideo.url.trim()) errors.url = "URL is required";
    else if (!isValidYoutubeUrl(newVideo.url))
      errors.url = "Invalid YouTube URL";
    else if (videos.some((video) => video.url === newVideo.url))
      errors.url = "This URL already exists for this node";
    return errors;
  };

  const isValidYoutubeUrl = (url) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVideo((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addVideo = async (e) => {
    e.preventDefault();
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const videoWithId = { ...newVideo, id: uuidv4() };
      await axiosInstance.post(`/node/${nodeId}/video`, videoWithId);
      setNewVideo({ id: "", title: "", url: "" });
      fetchVideos();
    } catch (error) {
      console.error("Failed to add video:", error);
      setErrors({ submit: "Failed to add video. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="video-modal">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold">Manage Videos</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xs"
        >
          ✕
        </button>
      </div>
      <form onSubmit={addVideo} className="video-form">
        <div className="form-group">
          <label htmlFor="title" className="text-xs">
            Title:
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={newVideo.title}
            onChange={handleInputChange}
            placeholder="Enter video title"
            className={errors.title ? "error" : ""}
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="url" className="text-xs">
            YouTube URL:
          </label>
          <input
            id="url"
            type="url"
            name="url"
            value={newVideo.url}
            onChange={handleInputChange}
            placeholder="Enter YouTube URL"
            className={errors.url ? "error" : ""}
          />
          {errors.url && <span className="error-message">{errors.url}</span>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-bl from-yellow-400 to-yellow-300 text-white p-2 text-sm"
        >
          {isLoading ? "Adding..." : "Add Video"}
        </button>
        {errors.submit && (
          <span className="error-message">{errors.submit}</span>
        )}
      </form>
    </div>
  );
};

export default AddVideo;

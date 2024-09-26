import axiosInstance from "../api/axiosConfig";
import React, { useState } from "react";
import "../MindMap.css";

const CopyLink = ({ nodeId, mindMapId }) => {
  const [link, setLink] = useState("");

  const copyLink = async () => {
    try {
      //I have not completed backend for this part yet.
      const response = await axiosInstance.get(`/api/nodes/${nodeId}/link`);
      const nodeLink = response.data;

      navigator.clipboard.writeText(nodeLink);
      setLink(nodeLink);
      alert("Link copied to clipboard: " + nodeLink);
    } catch (error) {
      console.error("Error generating link", error);
    }
  };

  return (
    <button
      onClick={copyLink}
      className="absolute top-[10px] right-[10px] z-1 p-2 text-xs bg-gradient-to-bl from-yellow-400 to-yellow-300 text-white font-semibold rounded-md"
    >
      Copy Link
    </button>
  );
};

export default CopyLink;

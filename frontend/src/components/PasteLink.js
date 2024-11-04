import axiosInstance from "../api/axiosConfig";
import React, { useState } from "react";
import "../MindMap.css";
const PasteLink = ({ node_Id, mindMapId }) => {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  const handlePasteLink = async () => {
    try {
      const childNodeId = link.split("/").pop();
      console.log("Node ID to attach:", childNodeId);
      const response = await axiosInstance.post(`/paste-link`, {
        nodeId: childNodeId,
        targetMindmapId: mindMapId,
        newParentId: node_Id,
      });
      console.log("Response from server:", response.data);
      alert(response.data);
      setError("");
    } catch (error) {
      console.error("Error pasting link", error);
      alert(
        error.response?.data || "An error occurred while pasting the link."
      );
      setError(error.response?.data || "An error occurred.");
    }
  };

  return (
    <div className="paste-link">
      {/*//fixed top-4 right-4 z-50*/}
      <div className="bg-white rounded-lg shadow-lg p-4 min-w-[300px]">
        <input
          className="border border-gray-300 rounded-md p-2 mb-2 w-full"
          type="text"
          placeholder="Paste the link here"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <button
          className="w-full z-1 p-2 text-xs bg-gradient-to-bl from-yellow-400 to-yellow-300 text-white font-semibold rounded-md"
          onClick={handlePasteLink}
        >
          {/*"bg-blue-500 text-white rounded-md p-2 w-full hover:bg-blue-600 transition duration-200"*/}
          Attach Node
        </button>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold text-xs">Error!</strong>
            <span className="block sm:inline text-xs"> {error} </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasteLink;

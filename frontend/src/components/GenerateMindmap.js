import axiosInstance from "../api/axiosConfig";
import React, { useState } from "react";
import "../MindMap.css";

const GenerateMindmap = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mindMapTitle, setMindMapTitle] = useState("");

  const handleCreateMindMap = async () => {
    if (!mindMapTitle.trim()) {
      setError("Please enter a valid title for your mindmap.");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(`/generate/${userId}`, {
        keyword: mindMapTitle,
      });

      if (response.status === 200) {
        setMindMapTitle("");
        setError("");
        setSuccess("Mindmap generated successfully!");
      } else if (response.status === 409) {
        setSuccess("");
        setError("A mindmap with this title already exists.");
      }
    } catch (error) {
      console.error("Error creating mindmap:", error);
      setError("Failed to create mindmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="items-center min-h-screen justify-center mt-20 ml-[30%]">
      {/* Search Bar */}
      <div className="px-4 py-2 w-full max-w-md">
        <div className="relative flex items-center justify-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-200">
          <input
            type="text"
            placeholder="Generate mindmaps..."
            value={mindMapTitle}
            onChange={(e) => setMindMapTitle(e.target.value)}
            className="pl-4 pr-10 py-2 w-full focus:outline-none rounded-lg text-gray-700 placeholder-gray-400 focus:ring-0"
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-bl from-yellow-400 to-yellow-200 text-white hover:bg-yellow-300 focus:outline-none focus:ring focus:ring-yellow-200"
            onClick={handleCreateMindMap}
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </button>
        </div>
        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center mt-4">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-200 fill-yellow-300"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span class="sr-only">Loading...</span>
          </div>
        )}
        {/* Error Message */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-xs mt-10"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 text-xs">
              <svg
                className="fill-current h-4 w-4 text-red-700 cursor-pointer"
                role="button"
                onClick={() => setError("")}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </div>
        )}
        {/* Success Message */}
        {success && (
          <div
            className="bg-teal-100 border border-teal-400 text-teal-700 px-4 py-3 rounded relative text-xs mt-10"
            role="alert"
          >
            <span className="block sm:inline">{success}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 text-xs">
              <svg
                className="fill-current h-4 w-4 text-teal-700 cursor-pointer"
                role="button"
                onClick={() => setSuccess("")}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateMindmap;

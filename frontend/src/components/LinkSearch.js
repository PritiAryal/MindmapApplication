import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosConfig";
import { ReactFlowProvider } from "reactflow";
import GetMindMap from "./GetMindMap";

const LinkSearch = ({ searchedMindMapId, onNodeClick }) => {
  const [mindmapData, setMindmapData] = useState([]);
  const [mindmapTitle, setMindmapTitle] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const current = "linkSearch";

  const fetchMindmaps = useCallback(async () => {
    if (!searchedMindMapId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/${searchedMindMapId}`);
      if (response.data && response.data.nodes) {
        setMindmapData(response.data.nodes);
        setMindmapTitle(response.data.title);
        console.log("response:", response.data.nodes);

        // Automatically select and show the first node if available
        if (response.data.nodes.length > 0) {
          onNodeClick(response.data.nodes[0]); // Select the first node
        }
      } else {
        setError("Unexpected response format");
      }
    } catch (error) {
      setError("Failed to fetch mindmaps");
    } finally {
      setLoading(false);
    }
  }, [searchedMindMapId, onNodeClick]);

  useEffect(() => {
    fetchMindmaps();
  }, [fetchMindmaps]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-auto bg-slate-100 py-2 pr-1 pl-2">
      <div className="h-full bg-white shadow-md rounded-lg p-4">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold mb-4">
            MindMap: {mindmapTitle}
          </h2>
          <div className="bg-slate-50 rounded-lg items-center justify-center">
            <div>
              {loading && <div>Loading...</div>}
              {error && <div className="text-red-500">{error}</div>}
              {mindmapData.length > 0 ? (
                <ReactFlowProvider>
                  <GetMindMap
                    mindMapId={searchedMindMapId}
                    onNodeClick={onNodeClick}
                    current={current}
                  />
                </ReactFlowProvider>
              ) : (
                <div>No nodes available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkSearch;

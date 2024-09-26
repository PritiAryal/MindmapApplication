import React, { useEffect, useState, useCallback, useMemo } from "react";
import axiosInstance from "../api/axiosConfig";

const SearchResult = ({
  userId,
  results,
  onResultClick,
  loading,
  error,
  isDefault,
  onDefaultResultClick,
}) => {
  const [defaultResults, setDefaultResults] = useState([]);

  const fetchMindmaps = useCallback(async () => {
    if (isDefault && results.length === 0) {
      try {
        const response = await axiosInstance.get(`/user/${userId}`);
        if (response.data.length > 0) {
          setDefaultResults(response.data);
          onDefaultResultClick(response.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch mindmaps:", err);
      }
    }
  }, [isDefault, results.length, userId, onDefaultResultClick]);

  useEffect(() => {
    fetchMindmaps();
  }, [fetchMindmaps]);

  // const displayResults = useMemo(() => {
  //     return results.length > 0 ? results : defaultResults;
  // }, [results, defaultResults]);

  const displayResults = useMemo(() => {
    return Array.isArray(results) && results.length > 0
      ? results
      : Array.isArray(defaultResults)
      ? defaultResults
      : [];
  }, [results, defaultResults]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (displayResults.length === 0) {
    return <p>No results found</p>;
  }

  return (
    <div className="w-1/4 bg-slate-100 py-2 pr-2 pl-1">
      <div className="h-full overflow-y-auto bg-white shadow-md rounded-lg p-4">
        <div className="space-y-4">
          <div className="bg-slate-50 p-1 rounded-lg">
            <div className="p-1">
              {displayResults.map((result) => (
                <div
                  key={result.id}
                  className="cursor-pointer hover:bg-gray-200 p-2 rounded"
                  onClick={() => onResultClick(result)}
                >
                  <h3 className="text-lg font-semibold mb-2">{result.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SearchResult);

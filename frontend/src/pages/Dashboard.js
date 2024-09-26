import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance, { setupAxiosInterceptors } from "../api/axiosConfig";
import MindMap from "../components/MindMap";
import { ReactFlowProvider } from "reactflow";
import Search from "../components/Search";
import LinkSearch from "../components/LinkSearch";
import Video from "../components/Video";
import SearchResult from "../components/SearchResult";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const [showMindMap, setShowMindMap] = useState(false);
  const [mindMapTitle, setMindMapTitle] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [mindMapId, setMindMapId] = useState(null);
  const [searchedMindMapId, setSearchedMindMapId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchedMindMap, setShowSearchedMindMap] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [isDefault, setIsDefault] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("fetchedId");
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    setupAxiosInterceptors(token, logout);

    const setLogoutTimer = (token) => {
      const decodedToken = jwtDecode(token);
      const expirationTime = decodedToken.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      if (timeUntilExpiration > 0) {
        setTimeout(logout, timeUntilExpiration);
      } else {
        logout();
      }
    };

    fetchUserInfo(token);
    setLogoutTimer(token);
  }, [navigate, logout]);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axiosInstance.post(
        "/loggedInApplicationuser",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserId(response.data.userID);
    } catch (error) {
      console.error("Error fetching user info:", error);
      navigate("/");
    }
  };

  const handleCreateMindMap = async () => {
    if (!mindMapTitle.trim()) {
      setError("Please enter a valid title for your mindmap.");
      return;
    }

    try {
      const response = await axiosInstance.post(`/user/${userId}`, {
        title: mindMapTitle,
      });

      const mindMapId = response.data.id;
      setMindMapId(mindMapId);
      setMindMapTitle("");
      setError("");
      setVideos([]);
      setSelectedNode(null);
      setActiveTab("search");
      setShowMindMap(true);

      setIsDialogOpen(false);

      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 300);
    } catch (error) {
      console.error("Error creating mindmap:", error);
      setError("Failed to create mindmap. Please try again.");
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setIsDefault(false);
    try {
      const response = await axiosInstance.get(`/user/${userId}/search`, {
        params: { query: searchText },
      });
      if (response.data.length === 0) {
        setError("No mindmaps found for your search.");
      }
      setSearchResults(response.data);
    } catch (error) {
      setError("Failed to fetch search results");
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback(async (node) => {
    setVideos([]);
    setSelectedNode(node);
    console.log(node.id);
    console.log(selectedNode);
    try {
      const response = await axiosInstance.get(`/node/${node.id}/video`);
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos for node", error);
    }
  }, []);
  // }, [selectedNode]);

  const handleResultClick = useCallback(async (result) => {
    setVideos([]);
    setSelectedResult(result);
    setSearchedMindMapId(result.id);
    setShowSearchedMindMap(true);
    try {
      const response = await axiosInstance.get(`/${result.id}`);
      setSelectedNode(response.data);
    } catch (error) {
      console.error("Error fetching mindmap data", error);
    }
  }, []);

  const handleDefaultResultClick = useCallback(
    (result) => {
      handleResultClick(result);
    },
    [handleResultClick]
  );

  const searchResultProps = useMemo(
    () => ({
      userId,
      results: searchResults,
      onResultClick: handleResultClick,
      onDefaultResultClick: handleDefaultResultClick,
      loading,
      error,
      isDefault,
    }),
    [
      userId,
      searchResults,
      handleResultClick,
      handleDefaultResultClick,
      loading,
      error,
      isDefault,
    ]
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("fetchedId");
    navigate("../");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-white shadow p-2">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">MindMap</div>

          <div className="max-w-full items-center">
            <div className="relative items-center border border-gray-300 rounded">
              <input
                type="text"
                placeholder="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-4 pr-10 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-l"
              />
              <button
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={handleSearch}
              >
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-bl from-yellow-400 to-yellow-300 text-bold text-xs text-white px-2 py-2 rounded hover:bg-blue-600"
            >
              Create Mindmap
            </button>

            <div className="relative">
              <button
                className="bg-white p-2 rounded hover:bg-gray-300 focus:outline-none"
                onClick={toggleDropdown}
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg py-2 z-10">
                  <a
                    href="#"
                    className="text-xs block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </a>
                  <a
                    href="#"
                    className="text-xs block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="flex flex-col">
        <div className="bg-white border-b border-gray-300">
          <div className="flex">
            <button
              className={`min-w-[18vw] px-5 py-2 text-center text-sm font-medium ${
                activeTab === "search"
                  ? "bg-gradient-to-t from-amber-50 to-white text-yellow-400 border-b-2 border-yellow-300"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("search")}
            >
              Search
            </button>
            <button
              className={`min-w-[18vw] px-5 py-2 text-center text-sm font-medium ${
                activeTab === "linkSearch"
                  ? "bg-gradient-to-t from-amber-50 to-white text-yellow-400 border-b-2 border-yellow-300"
                  : "text-gray-600"
              }`}
              //className={`min-w-[18vw] px-5 py-2 text-center text-sm font-medium ${activeTab === 'linkSearch' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab("linkSearch")}
            >
              Link Search
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-grow max-h-[80vh]">
        {activeTab === "search" ? (
          <Search
            searchedMindMapId={searchedMindMapId}
            onNodeClick={handleNodeClick}
          />
        ) : (
          <LinkSearch
            searchedMindMapId={searchedMindMapId}
            onNodeClick={handleNodeClick}
          />
        )}

        {userId && <SearchResult {...searchResultProps} />}
      </div>

      <div className="bg-slate-100 pb-2 pt-1 px-2 flex items-center space-x-2 overflow-x-auto mt-auto">
        <Video videos={videos} node={selectedNode} />
      </div>

      {isDialogOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div
              className="fixed inset-0 bg-black opacity-30"
              onClick={() => setIsDialogOpen(false)}
            ></div>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto z-20">
              <h2 className="text-lg font-bold">Create New Mindmap</h2>
              <div className="mt-4">
                <label
                  htmlFor="mindmap-title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="mindmap-title"
                  value={mindMapTitle}
                  onChange={(e) => setMindMapTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCreateMindMap}
                  className="p-2 w-full text-lg bg-gradient-to-bl from-yellow-400 to-yellow-300 text-white font-semibold rounded-md"
                >
                  Create Mindmap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMindMap && (
        <ReactFlowProvider>
          <MindMap mindMapId={mindMapId} />
        </ReactFlowProvider>
      )}
    </div>
  );
};

export default Dashboard;

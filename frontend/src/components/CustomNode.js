import React, { useState, useCallback, useRef } from "react";
//import PropTypes from 'prop-types';
import { Handle, Position } from "reactflow";
import {
  FaPlus,
  FaMinus,
  FaVideo,
  FaEllipsisH,
  FaCaretDown,
  FaAngleDown,
  FaLink,
} from "react-icons/fa";
import { createNode, createNodeData } from "../data";
import "../styles/CustomNode.css";
import { v4 as uuidv4 } from "uuid";
import axiosInstance from "../api/axiosConfig";
import AddVideo from "./AddVideo";

const CustomNode = ({ data, id }) => {
  console.log("mindMapId:", data.mindMapId);
  const [showIcons, setShowIcons] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const nodeRef = useRef(null);

  const handleMouseEnter = useCallback(() => setShowIcons(true), []);
  const handleMouseLeave = useCallback(() => {
    setShowIcons(false);
    setShowDropdown(false);
  }, []);

  const toggleExpand = useCallback(
    async (e) => {
      e.stopPropagation();
      if (typeof data.onToggleExpand === "function") {
        data.onToggleExpand(id);
      } else {
        console.error("onToggleExpand is not a function");
      }
      try {
        const response = await axiosInstance.put(`/node/${id}`, {
          expanded: !data.isExpanded,
        });
        console.log("Node expansion state updated:", response.data);
      } catch (error) {
        console.error("Failed to update node expansion state:", error);
      }
    },
    [id, data]
  );

  const addChildNode = useCallback(
    async (e) => {
      e.stopPropagation();
      let parentNodePosition;

      try {
        const response = await axiosInstance.get(`/node/${id}`);
        parentNodePosition = {
          x: response.data.x,
          y: response.data.y,
        };
      } catch (error) {
        console.error("Failed to fetch parent node:", error);
        return;
      }
      const childrenIds = data.children
        ? data.children.map((child) =>
            typeof child === "string" ? child : child.id
          )
        : [];
      const siblingCount = childrenIds.length;
      const newPosition = {
        x: parentNodePosition.x + 200,
        y: parentNodePosition.y + siblingCount * 100,
      };
      const newNodeData = createNodeData(
        data.label !== undefined ? data.label : "",
        childrenIds || [],
        data.isExpanded !== undefined ? data.isExpanded : true,
        data.onAddNode,
        data.onAddEdge,
        data.onToggleExpand,
        data.onUpdateNode,
        data.mindMapId
      );
      const newNode = createNode(
        uuidv4(),
        "",
        newPosition || { x: 0, y: 50 },
        newNodeData
      );
      newNode.data.parentId = id;
      data.onAddNode(newNode, id);
      console.log(newNode.data.mindMapId);
      try {
        const response = await axiosInstance.post(
          `/mindmap/${data.mindMapId}/node`,
          {
            id: newNode.id,
            label: newNode.data.label,
            parentId: newNode.data.parentId,
            x: newPosition.x || 0,
            y: newPosition.y || 50,
            expanded: true,
          }
        );
        console.log("Node created:", response.data);
      } catch (error) {
        console.error("Failed to create node:", error);
      }
    },
    [id, data]
  );

  const handleLabelChange = useCallback((e) => {
    setLabel(e.target.value);
  }, []);

  const handleLabelBlur = useCallback(async () => {
    setIsEditing(false);
    if (label.trim() === "") {
      setLabel("Unnamed Node");
    }
    data.onUpdateNode(id, label);
    try {
      const response = await axiosInstance.put(`/node/${id}`, {
        label: label.trim() === "" ? "Unnamed Node" : label,
      });
      console.log("Node label updated:", response.data);
    } catch (error) {
      console.error("Failed to update node label:", error);
    }
  }, [id, label, data]);

  const handleLabelClick = useCallback((e) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleDropdownClick = useCallback((e) => {
    e.stopPropagation();
    setShowDropdown((prev) => !prev);
  }, []);

  const handleManageVideos = useCallback((e) => {
    e.stopPropagation();
    setShowDropdown(false);
    setShowVideoModal(true);
  }, []);

  const closeVideoModal = useCallback(() => {
    setShowVideoModal(false);
  }, []);
  // const handleNodeClick = useCallback((e) => {
  //   if (!nodeRef.current.contains(e.target)) {
  //     setShowDropdown(false);
  //   }
  // }, []);

  const showPlusButton = data.children.length === 0 || data.isExpanded;

  return (
    <>
      <div
        className={`custom-node p-2 rounded-md transition-all duration-200 ${
          data.isActive || false
            ? "ring-2 ring-yellow-400"
            : "hover:bg-gray-100"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-expanded={data.isExpanded}
      >
        <Handle type="target" position={Position.Left} />
        {isEditing ? (
          <input
            value={label}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            autoFocus
            placeholder="Enter node name"
          />
        ) : (
          <div onClick={handleLabelClick}>{label || "Unnamed Node"}</div>
        )}
        {showIcons && (
          <>
            {showPlusButton && (
              <button
                className="node-button add-button"
                onClick={addChildNode}
                aria-label="Add child node"
              >
                <FaPlus size={12} />
              </button>
            )}
            {data.children.length > 0 && (
              <button
                className="node-button toggle-button"
                onClick={toggleExpand}
                aria-label={data.isExpanded ? "Collapse node" : "Expand node"}
              >
                {data.isExpanded ? (
                  <FaMinus size={12} />
                ) : (
                  <span>{data.children.length}</span>
                )}
              </button>
            )}
            <div className="dropdown-container">
              <button
                className="node-button dropdown-button"
                onClick={handleDropdownClick}
                aria-label="More options"
              >
                <FaAngleDown size={12} />
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <button onClick={handleManageVideos} className="text-xs">
                    Add Videos
                  </button>
                  <button className="text-xs">
                    {/* // onClick={handleCopyLink} */}
                    Copy Link
                  </button>
                  <button className="text-xs">Delete Node</button>
                </div>
              )}
            </div>
          </>
        )}
        <Handle type="source" position={Position.Right} />
      </div>
      {showVideoModal && <AddVideo nodeId={id} onClose={closeVideoModal} />}
    </>
  );
};

export default CustomNode;

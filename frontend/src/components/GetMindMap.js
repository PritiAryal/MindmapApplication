import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ReactFlow, {
  ProOptions,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import CustomNode from "./CustomNode";
import { createNode, createEdge, createNodeData } from "../data";
import "reactflow/dist/style.css";
import "../MindMap.css";
import axiosInstance from "../api/axiosConfig.js";
import CopyLink from "./CopyLink";
import PasteLink from "./PasteLink";

const nodeTypes = {
  custom: CustomNode,
};

const GetMindMap = ({ mindMapId, onNodeClick, current }) => {
  const navigate = useNavigate();
  console.log("mindMapId in GetMindMap:", mindMapId);

  if (!mindMapId) {
    console.error("mindMapId is undefined");
    navigate("../");
  }
  const proOptions = { hideAttribution: true };
  const [clickedNodeId, setClickedNodeId] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDragging, setIsDragging] = useState(false);
  const newParentIdRef = useRef(null);
  const newPositionRef = useRef(null);
  const onConnect = useCallback(
    async (params) => {
      const newEdge = {
        id: `e-${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        hidden: false,
      };

      setEdges((eds) => addEdge(newEdge, eds));

      try {
        const response = await axiosInstance.post(
          `/edges/${params.source}/${params.target}`,
          {
            hidden: false,
          }
        );
        console.log("Edge created:", response.data);
      } catch (error) {
        console.error("Failed to create edge:", error);
      }
    },
    [setEdges]
  );

  const handleUpdateNode = useCallback(
    async (nodeId, newLabel) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, label: newLabel } }
            : node
        )
      );

      try {
        await axiosInstance.put(`/node/${nodeId}`, {
          label: newLabel,
        });
        console.log("Node updated successfully");
      } catch (error) {
        console.error("Failed to update node:", error);
      }
    },
    [setNodes]
  );

  const updateEdge = async (edgeId, updatedData) => {
    try {
      await axiosInstance.put(`/edge/${edgeId}`, updatedData);
      console.log(
        `Edge ${edgeId} updated successfully with hidden: ${updatedData.hidden}`
      );
    } catch (error) {
      console.error(`Error updating edge ${edgeId}:`, error);
    }
  };

  const updateNode = async (nodeId, updatedData) => {
    try {
      await axiosInstance.put(`/node/${nodeId}`, updatedData);
      console.log(`Node ${nodeId} updated successfully`);
    } catch (error) {
      console.error(`Error updating node ${nodeId}:`, error);
    }
  };

  const handleToggleExpand = useCallback(
    async (nodeId) => {
      setNodes((nds) => {
        const recursivelyUpdateVisibility = (nodes, parentId, shouldExpand) => {
          return nodes.map((node) => {
            if (node.data.parentId === parentId) {
              node.hidden = !shouldExpand;

              if (shouldExpand) {
                nodes = recursivelyUpdateVisibility(
                  nodes,
                  node.id,
                  node.data.isExpanded
                );
              } else {
                nodes = recursivelyUpdateVisibility(nodes, node.id, false);
              }
            }
            return node;
          });
        };

        const toggleNodeExpand = (nodes, currentId, shouldExpand) => {
          return nodes.map((node) => {
            if (node.id === currentId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  isExpanded: shouldExpand,
                },
              };
            }
            return node;
          });
        };

        const currentNode = nds.find((n) => n.id === nodeId);
        const shouldExpand = currentNode ? !currentNode.data.isExpanded : false;

        let updatedNodes = toggleNodeExpand(nds, nodeId, shouldExpand);
        updatedNodes = recursivelyUpdateVisibility(
          updatedNodes,
          nodeId,
          shouldExpand
        );

        const nodeToUpdate = updatedNodes.find((n) => n.id === nodeId);
        updateNode(nodeId, {
          expanded: nodeToUpdate.data.isExpanded,
        });

        setEdges((eds) => {
          const updatedEdges = eds.map((edge) => {
            const sourceNode = updatedNodes.find((n) => n.id === edge.source);
            const targetNode = updatedNodes.find((n) => n.id === edge.target);
            const hidden =
              (sourceNode && sourceNode.hidden) ||
              (targetNode && targetNode.hidden);

            updateEdge(edge.id, { hidden });

            return {
              ...edge,
              hidden,
            };
          });

          return updatedEdges;
        });

        return updatedNodes;
      });
    },
    [setNodes, setEdges]
  );

  const handleAddChildNode = useCallback(
    async (newNode, parentId) => {
      setNodes((nds) => {
        const parentNode = nds.find((n) => n.id === parentId);

        if (!parentNode || !parentNode.data) {
          console.error("Parent node or its data is undefined.");
          return nds;
        }

        if (!parentNode.data.children) {
          parentNode.data.children = [];
        }

        parentNode.data.children.push(newNode.id);

        const siblingCount = parentNode.data.children.length - 1;
        const parentPosition = parentNode.position;

        const newPosition = {
          x: parentPosition.x + 200,
          y: parentPosition.y + siblingCount * 100,
        };

        newPositionRef.current = newPosition;

        const updatedNewNode = {
          ...newNode,
          position: newPosition,
        };

        return [...nds, updatedNewNode];
      });

      const newEdge = createEdge(
        `e-${parentId}-${newNode.id}`,
        parentId,
        newNode.id,
        false
      );
      setEdges((eds) => [...eds, newEdge]);

      console.log(
        `New position for node ${newNode.id}:`,
        newPositionRef.current
      );

      setTimeout(async () => {
        try {
          if (newPositionRef.current) {
            await axiosInstance.put(`/node/${newNode.id}`, {
              X: newPositionRef.current.x,
              Y: newPositionRef.current.y,
            });
            console.log(
              "Node position updated successfully in backend" +
                newPositionRef.current.x +
                newPositionRef.current.y
            );
          }

          const response = await axiosInstance.post(
            `/edges/${parentId}/${newNode.id}`,
            {
              hidden: false,
            }
          );
          console.log("Edge created:", response.data);
        } catch (error) {
          console.error(
            "Failed to update node position or create edge:",
            error
          );
        }
      }, 200);
    },
    [setNodes, setEdges]
  );

  const handleNodeDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onNodeDragStop = useCallback(
    async (event, draggedNode) => {
      setIsDragging(false);
      console.log(`Node being dragged: ${draggedNode.id}`);
      const draggedNodeElement = event.target;
      const draggedNodeBounds = draggedNodeElement.getBoundingClientRect();
      let newParentId = null;

      const isDescendant = (nodeId, potentialDescendantId, nodes) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) {
          console.log(`Node ${nodeId} not found.`);
          return false;
        }
        if (!node.data.children) {
          console.log(`Node ${nodeId} has no children.`);
          return false;
        }
        if (node.data.children.includes(potentialDescendantId)) {
          console.log(
            `Node ${nodeId} is a direct parent of ${potentialDescendantId}`
          );
          return true;
        }
        console.log(
          `Checking descendants of ${nodeId} for ${potentialDescendantId}`
        );
        return node.data.children.some((childId) =>
          isDescendant(childId, potentialDescendantId, nodes)
        );
      };

      let existingEdge = null;
      let updatedNodes = [];

      const updateNodesAndEdges = () =>
        new Promise((resolve) => {
          setNodes((nds) => {
            updatedNodes = [...nds];

            nds.forEach((node) => {
              if (node.id !== draggedNode.id) {
                const nodeElement = document.querySelector(
                  `[data-id="${node.id}"]`
                );
                if (nodeElement) {
                  const nodeBounds = nodeElement.getBoundingClientRect();
                  const isOverlapping = !(
                    draggedNodeBounds.right < nodeBounds.left ||
                    draggedNodeBounds.left > nodeBounds.right ||
                    draggedNodeBounds.bottom < nodeBounds.top ||
                    draggedNodeBounds.top > nodeBounds.bottom
                  );
                  console.log(
                    `Node ${draggedNode.id} is overlapping with node ${node.id}: ${isOverlapping}`
                  );

                  if (
                    isOverlapping &&
                    !node.id.startsWith(draggedNode.id) &&
                    !draggedNode.id.startsWith(node.id)
                  ) {
                    console.log(
                      `Node ${draggedNode.id} is overlapping with node ${node.id} and nds ${nds}`
                    );
                    if (!isDescendant(draggedNode.id, node.id, nds)) {
                      newParentId = node.id;
                    }
                  }
                }
              }
            });

            console.log("New Parent ID:", newParentId);

            const currentParent = updatedNodes.find(
              (node) =>
                node.data.children &&
                node.data.children.includes(draggedNode.id)
            );

            if (newParentId) {
              if (currentParent) {
                currentParent.data.children =
                  currentParent.data.children.filter(
                    (id) => id !== draggedNode.id
                  );
                updatedNodes = updatedNodes.map((node) => {
                  if (node.id === currentParent.id) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        isExpanded: false,
                      },
                      hidden: false,
                    };
                  }
                  return node;
                });
              }

              const newParentIndex = updatedNodes.findIndex(
                (n) => n.id === newParentId
              );
              updatedNodes[newParentIndex] = {
                ...updatedNodes[newParentIndex],
                data: {
                  ...updatedNodes[newParentIndex].data,
                  children: [
                    ...(updatedNodes[newParentIndex].data.children || []),
                    draggedNode.id,
                  ],
                  isExpanded: true,
                },
              };

              const newParentNode = updatedNodes.find(
                (node) => node.id === newParentId
              );
              const newParentPosition = newParentNode.position;

              const newPosition = {
                x: newParentPosition.x + 200,
                y:
                  newParentPosition.y +
                  newParentNode.data.children.length * 100,
              };

              const draggedNodeIndex = updatedNodes.findIndex(
                (n) => n.id === draggedNode.id
              );
              updatedNodes[draggedNodeIndex] = {
                ...draggedNode,
                position: newPosition,
                data: {
                  ...draggedNode.data,
                  parentId: newParentId,
                },
              };

              const updateChildrenPositions = (nodeId, parentPosition) => {
                updatedNodes = updatedNodes.map((node) => {
                  if (node.id.startsWith(`${nodeId}-`)) {
                    return {
                      ...node,
                      position: {
                        x: parentPosition.x + 200,
                        y: parentPosition.y + node.data.children.length * 100,
                      },
                      data: {
                        ...node.data,
                        parentId: node.data.parentId
                          ? `${newParentId}-${node.data.parentId
                              .split("-")
                              .pop()}`
                          : newParentId,
                      },
                    };
                  }
                  return node;
                });
              };
              updateChildrenPositions(draggedNode.id, newPosition);
            }

            return updatedNodes;
          });

          setEdges((eds) => {
            let newEdges = eds.filter((e) => e.target !== draggedNode.id);

            existingEdge = eds.find((e) => e.target === draggedNode.id);

            if (newParentId) {
              newEdges.push({
                id: `e-${newParentId}-${draggedNode.id}`,
                source: newParentId,
                target: draggedNode.id,
              });
            } else if (existingEdge) {
              newEdges.push(existingEdge);
            }

            resolve();
            return newEdges;
          });
        });

      await updateNodesAndEdges();

      const updatePayload = {
        x: draggedNode.position.x,
        y: draggedNode.position.y,
        ...(newParentId && { parentId: newParentId }),
      };

      console.log("Update payload:", updatePayload);

      try {
        await axiosInstance.put(`/node/${draggedNode.id}`, updatePayload);
        console.log("Node parent and position updated successfully");
      } catch (error) {
        console.error("Error updating node:", error);
      }

      try {
        if (newParentId && existingEdge) {
          const edgePayload = {
            sourceId: newParentId,
            targetId: draggedNode.id,
          };

          await axiosInstance.put(`/edge/${existingEdge.id}`, edgePayload);
          console.log("Edge updated successfully");
        }
      } catch (error) {
        console.error("Error updating edge:", error);
      }

      console.log(`Node being dragged: ${draggedNode.id}`);
      console.log("New Parent ID:", newParentId);
      console.log("Update Payload:", updatePayload);
      console.log("State after updating:", updatedNodes);
    },
    [setNodes, setEdges]
  );

  const handleNodeClick = (nodeId) => {
    if (!isDragging) {
      setClickedNodeId(nodeId);
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isActive: node.id === nodeId,
          },
        }))
      );

      const clickedNode = nodes.find((node) => node.id === nodeId);
      if (clickedNode && onNodeClick) {
        if (!isDragging) {
          onNodeClick(clickedNode);
        }
      }
    }
  };

  const handleCanvasClick = () => {
    if (!isDragging) {
      setClickedNodeId(null);
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isActive: false,
          },
        }))
      );
    }
  };
  useEffect(() => {
    if (!isDragging) {
      setClickedNodeId(null);
    }
  }, [mindMapId]);

  useEffect(() => {
    console.log("Nodes:", nodes);
    console.log("Edges:", edges);
    const fetchData = async () => {
      try {
        const mindMapResponse = await axiosInstance.get(`/${mindMapId}`);
        const mindMapData = mindMapResponse.data;

        const nodesResponse = await axiosInstance.get(
          `/mindmap/${mindMapId}/node`
        );
        const nodesData = nodesResponse.data;

        const edgePromises = nodesData.map((node) =>
          axiosInstance.get(`/nodes/${node.id}/edges`)
        );
        const edgesResponses = await Promise.all(edgePromises);
        const edgesData = edgesResponses.flatMap((response) => response.data);
        console.log(
          "Raw Edges Data with Hidden Field:",
          edgesData.map((edge) => ({
            id: edge.id,
            hidden: edge.hidden,
          }))
        );
        const extractTargetId = (edgeId, sourceId) => {
          const parts = edgeId.split(`-${sourceId}-`);
          return parts.length > 1 ? parts[1] : "";
        };

        console.log(
          "Edge IDs:",
          edgesData.map((edge) => edge.id)
        );

        const recursivelyUpdateVisibility = (nodes, parentId, shouldExpand) => {
          return nodes.map((node) => {
            if (node.data.parentId === parentId) {
              node.hidden = !shouldExpand;

              recursivelyUpdateVisibility(
                nodes,
                node.id,
                shouldExpand && node.data.isExpanded
              );
            }
            return node;
          });
        };

        const transformedNodes = nodesData.map((node) => {
          const nodeEdges = edgesData.filter((edge) =>
            edge.id.startsWith(`e-${node.id}-`)
          );
          const transformedEdges = nodeEdges.map((edge) =>
            createEdge(
              edge.id,
              node.id,
              extractTargetId(edge.id, node.id),
              edge.hidden
            )
          );

          const childrenIds = node.children
            ? node.children.map((child) =>
                typeof child === "string" ? child : child.id
              )
            : [];
          const newNodeData = createNodeData(
            node.label,
            childrenIds,
            node.expanded,
            handleAddChildNode,
            () => setEdges(transformedEdges),
            handleToggleExpand,
            handleUpdateNode,
            mindMapId
          );
          const newNode = createNode(
            node.id,
            "custom",
            { x: node.x, y: node.y },
            newNodeData
          );
          newNode.data.parentId = node.parentId;
          return newNode;
        });

        console.log(
          "Transformed Nodes:",
          JSON.stringify(transformedNodes, null, 2)
        );
        const finalNodes = recursivelyUpdateVisibility(
          transformedNodes,
          null,
          true
        );

        setNodes(finalNodes);

        const allEdges = nodesData.flatMap((node) =>
          edgesData
            .filter((edge) => edge.id.startsWith(`e-${node.id}-`))
            .map((edge) =>
              createEdge(
                edge.id,
                node.id,
                extractTargetId(edge.id, node.id),
                edge.hidden
              )
            )
        );

        console.log(
          "All edges transformed:",
          JSON.stringify(allEdges, null, 2)
        );
        setEdges(allEdges);

        console.log("MindMap data fetched:", mindMapData);
        console.log(
          "Nodes data fetched:",
          JSON.stringify(transformedNodes, null, 2)
        );
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    if (mindMapId) {
      fetchData();
    }
  }, [
    mindMapId,
    setNodes,
    setEdges,
    handleAddChildNode,
    handleToggleExpand,
    handleUpdateNode,
  ]);

  return (
    <div className="get-mindmap-container">
      <ReactFlow
        proOptions={proOptions}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={(_, node) => handleNodeClick(node.id)}
        onPaneClick={handleCanvasClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
      {current === "search" && clickedNodeId && (
        <CopyLink nodeId={clickedNodeId} mindMapId={mindMapId} />
      )}
      {current === "linkSearch" && clickedNodeId && (
        <PasteLink nodeId={clickedNodeId} mindMapId={mindMapId} />
      )}
    </div>
  );
};

export default GetMindMap;

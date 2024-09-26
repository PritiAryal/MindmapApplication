import React, { useCallback, useRef } from "react";
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
import { createNodeData, createEdge, createNode } from "../data";
import "reactflow/dist/style.css";
import "../MindMap.css";
import { v4 as uuidv4 } from "uuid";
import axiosInstance from "../api/axiosConfig.js";

const nodeTypes = {
  custom: CustomNode,
};

const MindMap = ({ mindMapId }) => {
  if (!mindMapId) {
    console.error("mindMapId is undefined");
  }

  const proOptions = { hideAttribution: true };

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const newParentIdRef = useRef(null);

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

      try {
        await axiosInstance.put(`/node/${newNode.id}`, {
          x: newNode.position.x,
          y: newNode.position.y,
        });
        console.log("Node updated successfully");
      } catch (error) {
        console.error("Failed to update node:", error);
      }
      try {
        const response = await axiosInstance.post(
          `/edges/${parentId}/${newNode.id}`,
          {
            hidden: false,
          }
        );
        console.log("Edge created:", response.data);
      } catch (error) {
        console.error("Failed to create edge:", error);
      }
    },
    [setNodes, setEdges]
  );

  const handleAddNode = useCallback(async () => {
    const newNodeData = createNodeData(
      `Central Idea ${nodes.length + 1}`,
      [],
      true,
      handleAddChildNode,
      (edge) => setEdges((eds) => [...eds, edge]),
      handleToggleExpand,
      handleUpdateNode,
      mindMapId
    );

    const position = {
      x: nodes.length === 0 ? 250 : nodes[nodes.length - 1].position.x + 250,
      y: nodes.length === 0 ? 100 : nodes[nodes.length - 1].position.y,
    };

    const newNode = createNode(
      uuidv4(),
      `Central Idea ${nodes.length + 1}`,
      position,
      newNodeData
    );

    setNodes((nds) => [...nds, newNode]);
    try {
      const response = await axiosInstance.post(`/mindmap/${mindMapId}/node`, {
        id: newNode.id,
        label: newNode.data.label,
        parentId: null,
        x: position.x,
        y: position.y,
        expanded: true,
      });
      console.log("Node created:", response.data);
    } catch (error) {
      console.error("Failed to create node:", error);
    }
  }, [
    nodes,
    setNodes,
    setEdges,
    handleAddChildNode,
    handleToggleExpand,
    handleUpdateNode,
    mindMapId,
  ]);

  const onNodeDragStop = useCallback(
    async (event, draggedNode) => {
      console.log(`Node being dragged: ${draggedNode.id}`);
      const draggedNodeElement = event.target;
      const draggedNodeBounds = draggedNodeElement.getBoundingClientRect();
      let newParentId = null;

      const isDescendant = (nodeId, potentialDescendantId, nodes) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node || !node.data.children) return false;
        if (node.data.children.includes(potentialDescendantId)) return true;
        return node.data.children.some((childId) =>
          isDescendant(childId, potentialDescendantId, nodes)
        );
      };

      let existingEdge = null;

      setNodes((nds) => {
        let updatedNodes = [...nds];

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

              if (
                isOverlapping &&
                !node.id.startsWith(draggedNode.id) &&
                !draggedNode.id.startsWith(node.id)
              ) {
                if (!isDescendant(draggedNode.id, node.id, nds)) {
                  newParentId = node.id;
                }
              }
            }
          }
        });

        newParentIdRef.current = newParentId;

        const currentParent = updatedNodes.find(
          (node) =>
            node.data.children && node.data.children.includes(draggedNode.id)
        );

        if (newParentId) {
          if (currentParent) {
            currentParent.data.children = currentParent.data.children.filter(
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

          const newParent = updatedNodes[newParentIndex];
          const draggedNodeIndex = updatedNodes.findIndex(
            (n) => n.id === draggedNode.id
          );
          updatedNodes[draggedNodeIndex] = {
            ...draggedNode,
            position: {
              x: draggedNode.position.x - newParent.position.x,
              y: draggedNode.position.y - newParent.position.y,
            },
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
                    x: node.position.x - parentPosition.x,
                    y: node.position.y - parentPosition.y,
                  },
                  data: {
                    ...node.data,
                    parentId: node.data.parentId
                      ? `${newParentId}-${node.data.parentId.split("-").pop()}`
                      : newParentId,
                  },
                };
              }
              return node;
            });
          };
          updateChildrenPositions(draggedNode.id, draggedNode.position);
        }

        return updatedNodes;
      });

      setEdges((eds) => {
        let newEdges = eds.filter((e) => e.target !== draggedNode.id);

        existingEdge = eds.find((e) => e.target === draggedNode.id);

        if (newParentId) {
          newEdges.push(
            createEdge(
              `e-${newParentId}-${draggedNode.id}`,
              newParentId,
              draggedNode.id
            )
          );
        } else {
          const existingEdge = eds.find((e) => e.target === draggedNode.id);
          if (existingEdge) {
            newEdges.push(existingEdge);
          }
        }

        return newEdges;
      });

      try {
        const updatePayload = {
          x: draggedNode.position.x,
          y: draggedNode.position.y,
        };

        if (
          newParentIdRef.current !== null &&
          newParentIdRef.current !== undefined
        ) {
          updatePayload.parentId = newParentIdRef.current;
        }

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
        console.error("Error updating node or edge:", error);
      }

      console.log(`Node being dragged: ${draggedNode.id}`);
    },
    [setNodes, setEdges, nodes, edges]
  );

  return (
    <div className="mindmap-container">
      <ReactFlow
        proOptions={proOptions}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
      <button
        onClick={handleAddNode}
        className="absolute top-[10px] right-[10px] z-1 p-2 text-lg bg-gradient-to-bl from-yellow-400 to-yellow-300 text-white font-semibold rounded-md"
        aria-label="Add new central idea"
      >
        +
      </button>
    </div>
  );
};

export default MindMap;

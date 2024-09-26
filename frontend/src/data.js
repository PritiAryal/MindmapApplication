export const createNodeData = (
  label = "",
  children = [],
  isExpanded = true,
  onAddNode,
  onAddEdge,
  onToggleExpand,
  onUpdateNode,
  mindMapId
) => ({
  label,
  children,
  isExpanded,
  onAddNode,
  onAddEdge,
  onToggleExpand,
  onUpdateNode,
  mindMapId,
});

export const createEdge = (id, source, target, hidden = false) => ({
  id,
  source,
  target,
  hidden, // hidden is passed directly
});

export const createNode = (id, label, position, data) => ({
  id,
  type: "custom",
  position,
  data,
});

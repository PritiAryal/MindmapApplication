import React, { useMemo } from "react";
import { getBezierPath, EdgeText } from "reactflow";

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const moveCount = data?.moveCount || 0;

  const getEdgeStyle = (moveCount) => {
    let strokeColor = "#ddd";
    let strokeWidth = 2;

    if (moveCount > 0 && moveCount <= 10) {
      strokeColor = "#888";
      strokeWidth = 2;
    } else if (moveCount > 10 && moveCount <= 20) {
      strokeColor = "#555";
      strokeWidth = 3;
    } else if (moveCount > 20) {
      strokeColor = "#333";
      strokeWidth = 4;
    }

    console.log(
      `Edge ${id}: moveCount = ${moveCount}, color = ${strokeColor}, width = ${strokeWidth}`
    );
    return { stroke: strokeColor, strokeWidth: strokeWidth };
  };

  const edgeStyle = useMemo(() => getEdgeStyle(moveCount), [moveCount, id]);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={{ ...style, ...edgeStyle }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
    </>
  );
};

export default CustomEdge;

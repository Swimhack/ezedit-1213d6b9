
import React from "react";

const SplitHandle: React.FC<{
  direction?: "vertical" | "horizontal";
  elementRef?: React.RefObject<HTMLDivElement>;
  dragging?: boolean;
}> = ({ direction = "vertical", elementRef, dragging = false }) => {
  return (
    <div
      ref={elementRef}
      className={`gutter-${direction} ${
        dragging ? "gutter-dragging" : ""
      } flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
        direction === "vertical" ? "cursor-row-resize" : "cursor-col-resize"
      }`}
    >
      <div className="gutter-handle flex items-center justify-center">
        {direction === "vertical" ? (
          <div className="h-1 w-6 rounded-full bg-gray-300 dark:bg-gray-600" />
        ) : (
          <div className="w-1 h-6 rounded-full bg-gray-300 dark:bg-gray-600" />
        )}
      </div>
    </div>
  );
};

export default SplitHandle;

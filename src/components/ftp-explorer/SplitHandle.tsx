
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
      role="separator"
      aria-orientation={direction === "vertical" ? "horizontal" : "vertical"}
      aria-valuenow={50}
      aria-valuemin={10}
      aria-valuemax={90}
      tabIndex={0}
      aria-label={`Resize ${direction === "vertical" ? "height" : "width"}`}
    >
      <div className="gutter-handle flex items-center justify-center">
        {direction === "vertical" ? (
          <div className="h-1 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
        ) : (
          <div className="w-1 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
        )}
      </div>
    </div>
  );
};

export default SplitHandle;

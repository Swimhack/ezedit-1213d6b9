
import React from "react";

const SplitHandle: React.FC<{
  direction: "vertical" | "horizontal";
  elementRef: React.RefObject<HTMLDivElement>;
  dragging: boolean;
}> = ({ direction, elementRef, dragging }) => {
  return (
    <div
      ref={elementRef}
      className={`gutter-${direction} ${
        dragging ? "gutter-dragging" : ""
      } flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-row-resize`}
    >
      <div className="gutter-handle flex items-center justify-center">
        <div className="h-1 w-6 rounded-full bg-gray-300 dark:bg-gray-600" />
      </div>
    </div>
  );
};

export default SplitHandle;

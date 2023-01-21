import classNames from "classnames";
import React from "react";

type Props = {
  onPageSelect: (pageNumber: number) => void;
  currentPage: number;
  totalPages: number;
  className?: string;
};

const PaginationPicker = ({
  currentPage,
  totalPages,
  className,
  onPageSelect,
}: Props) => {
  return (
    <div className={`btn-group ${className}`}>
      <button
        className={classNames("btn", { "btn-disabled": currentPage <= 1 })}
        onClick={() => onPageSelect(currentPage - 1)}
      >
        «
      </button>
      <label className="p-3 font-semibold">Page {currentPage}</label>
      <button
        onClick={() => onPageSelect(currentPage + 1)}
        className={classNames("btn", {
          "btn-disabled": totalPages <= currentPage || totalPages == 0,
        })}
      >
        »
      </button>
    </div>
  );
};

export default PaginationPicker;

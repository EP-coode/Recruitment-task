import * as React from "react";
import { useContext, useState } from "react";

import { FetchStatus } from "../common/fetchStatus";
import { ModalContext } from "../context/ModalContext";
import { useProductsWithPagination } from "../hooks/useProductsWithPagination";
import { Product } from "../model/Product";
import { productRepository } from "../repositories/ReqResApiProductRepo";
import { isValidId } from "../utils/parsing";
import PaginationPicker from "./PaginationPicker";

export default function ProductsTable({
  className,
  rowsPerPage = 5,
}: {
  className?: string;
  rowsPerPage?: number;
}) {
  const {
    products,
    currentPage,
    total_pages,
    setCurrentPage,
    setIdFilter,
    fetchStatus,
    idFilter,
  } = useProductsWithPagination(productRepository, rowsPerPage);

  const [idFilterFieldValue, setIdFilterFieldValue] = useState(
    idFilter?.toString() ?? ""
  );

  const modalContext = useContext(ModalContext);

  const noData =
    fetchStatus == FetchStatus.NOT_FOUND ||
    (fetchStatus == FetchStatus.OK && products?.length == 0);

  const handleChangePage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDetailsClick = (product: Product) => {
    modalContext.setupModal(`Details of product`, product, true);
    modalContext.show();
  };

  // TODO: it might be better to use onKeydown in future
  const handleIdFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    const idValid = isValidId(newValue);
    const isDeletion = newValue.length < idFilterFieldValue.length;

    if (idValid || isDeletion) {
      setIdFilterFieldValue(newValue);
    }

    if (idValid) {
      setIdFilter(parseInt(newValue));
    } else {
      setIdFilter(null);
    }
  };

  return (
    <div
      className={`overflow-x-auto min-h-[26rem] min-w-fit flex flex-col justify-between items-center ${className}`}
    >
      <table className="table table-auto w-full">
        <thead>
          <tr>
            <th className="flex items-center gap-3 min-w-[10rem] border-none">
              Id
              <input
                value={idFilterFieldValue}
                type="text"
                min={1}
                placeholder="Fiter by id"
                className="input input-sm input-bordered max-w-[6rem]"
                onChange={handleIdFilterChange}
              />
            </th>
            <th className="border-none">Name</th>
            <th className="border-none">Year</th>
          </tr>
        </thead>

        <tbody>
          {fetchStatus == FetchStatus.OK &&
            products?.map((product) => {
              const { id, name, year, color } = product;
              return (
                <tr
                  style={{ backgroundColor: color }}
                  className="cursor-pointer hover:brightness-90 duration-200"
                  key={id}
                  onClick={() => handleDetailsClick(product)}
                >
                  <th className="bg-inherit border-none text-transparent font-bold bg-clip-text invert grayscale contrast-[9]">
                    {id}
                  </th>
                  <td className="bg-inherit border-none text-transparent font-bold bg-clip-text invert grayscale contrast-[9]">
                    {name}
                  </td>
                  <td className="bg-inherit border-none text-transparent font-bold bg-clip-text invert grayscale contrast-[9]">
                    {year}
                  </td>
                </tr>
              );
            })}
          {fetchStatus == FetchStatus.LOADING && (
            <tr>
              <td className="h-64 text-center" colSpan={4}>
                <progress className="progress w-56"></progress>
              </td>
            </tr>
          )}
          {noData && (
            <tr>
              <td className="h-64 text-center uppercase" colSpan={4}>
                no data found
              </td>
            </tr>
          )}
          {fetchStatus == FetchStatus.ERROR && (
            <tr>
              <td className="h-64 text-center uppercase" colSpan={4}>
                something went wrong
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <PaginationPicker
        currentPage={currentPage}
        onPageSelect={handleChangePage}
        totalPages={total_pages ?? 0}
      />
    </div>
  );
}

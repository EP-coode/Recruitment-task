import * as React from "react";
import { useContext, useState, useEffect, useCallback } from "react";
import { FetchStatus } from "../common/fetchStatus";
import { ModalContext } from "../context/ModalContext";
import { useProductsWithPagination } from "../hooks/useProductsWithPagination";
import { Product } from "../model/Product";
import { productRepository } from "../repositories/ReqResApiProductRepo";
import { debounce } from "../utils/debounce";
import PaginationPicker from "./PaginationPicker";

const ROWS_PER_PAGE = 5;
const idFilterMatcher = new RegExp("^([1-9][0-9]*)$", "gm");

export default function ProductsTable() {
  const {
    products,
    currentPage,
    total_pages,
    setCurrentPage,
    setIdFilter,
    fetchStatus,
    idFilter
  } = useProductsWithPagination(productRepository, ROWS_PER_PAGE);
  const [idFilterFieldValue, setIdFilterFieldValue] = useState(idFilter);
  const modalContext = useContext(ModalContext);

  const handleChangePage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const onDetailsClick = (product: Product) => {
    modalContext.setupModal(
      `Details of product id: ${product.id}`,
      product,
      true,
      []
    );
    modalContext.show();
  };

  const handleIdFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const match = newValue.match(idFilterMatcher);
    if (match || newValue.length == 0) {
      setIdFilterFieldValue(newValue);
    }
  };

  const debouncedSetIdFilter = useCallback(
    debounce((filterId: string) => {
      setIdFilter(filterId);
    }, 800),
    []
  );

  useEffect(() => {
    debouncedSetIdFilter(idFilterFieldValue);
  }, [idFilterFieldValue]);

  return (
    <div className="overflow-x-auto min-h-[26rem] min-w-fit flex flex-col justify-between items-center">
      <table className="table table-auto w-full">
        <thead>
          <tr>
            <th className="flex items-center gap-3 min-w-[10rem]">
              Id
              <input
                value={idFilterFieldValue}
                type="text"
                min={1}
                placeholder="Fiter by id"
                className="input input-sm input-bordered w-full"
                onChange={handleIdFilterChange}
              />
            </th>
            <th>Name</th>
            <th>Year</th>
          </tr>
        </thead>

        <tbody>
          {fetchStatus == FetchStatus.OK &&
            products?.map((product) => {
              const { id, name, year, color } = product;
              return (
                <tr
                  style={{ backgroundColor: color }}
                  className="cursor-pointer hover:brightness-90"
                  key={id}
                  onClick={() => onDetailsClick(product)}
                >
                  <th className="bg-inherit text-transparent font-bold bg-clip-text invert grayscale contrast-[9]">
                    {id}
                  </th>
                  <td className="bg-inherit text-transparent font-bold bg-clip-text invert grayscale contrast-[9]">
                    {name}
                  </td>
                  <td className="bg-inherit text-transparent font-bold bg-clip-text invert grayscale contrast-[9]">
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
          {(fetchStatus == FetchStatus.NOT_FOUND ||
            (fetchStatus == FetchStatus.OK && products?.length == 0)) && (
            <tr>
              <td className="h-64 text-center" colSpan={4}>
                NO DATA FOUND
              </td>
            </tr>
          )}
          {fetchStatus == FetchStatus.ERROR && (
            <tr>
              <td className="h-64 text-center" colSpan={4}>
                SOMETHING WENT WRONG
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

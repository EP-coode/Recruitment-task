import { useEffect, useState } from "react";
import { FetchStatus } from "../common/fetchStatus";
import { NotFound } from "../errors/NotFound";
import { Pagination } from "../model/Pagination";
import { Product } from "../model/Product";
import { IProductRepository } from "../repositories/IProductRepository";
import { useSearchParams } from "react-router-dom";

const DEFAULT_POST_PER_PAGE = 5;

export const useProductsWithPagination = (
  poductsRepo: IProductRepository,
  postPerPage: number
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") ?? "");

  const [idFilter, setIdFilter] = useState(searchParams.get("id") ?? "");
  const [currentPage, setCurrentPage] = useState(
    isNaN(initialPage) ? 1 : Math.max(initialPage, 1)
  );

  const [productsWithPagination, setPorductsWithPagination] =
    useState<Pagination<Product> | null>(null);
  postPerPage = postPerPage <= 1 ? DEFAULT_POST_PER_PAGE : postPerPage;

  const [fetchStatus, setFetchStatus] = useState(FetchStatus.IDDLE);

  const handleFilterChange = (idFilter: string) => {
    setIdFilter(idFilter);
  };

  useEffect(() => {
    const getProdcuts = async () => {
      if (idFilter.length <= 0) {
        try {
          const porductsWithPagination =
            await poductsRepo.getProductsPagination(currentPage, postPerPage);
          setPorductsWithPagination(porductsWithPagination);
          setFetchStatus(FetchStatus.OK);
        } catch (e) {
          if (e instanceof NotFound) {
            setFetchStatus(FetchStatus.NOT_FOUND);
          } else {
            setFetchStatus(FetchStatus.ERROR);
          }
        }
      } else {
        try {
          const product = await poductsRepo.getProductById(parseInt(idFilter));

          setPorductsWithPagination({
            data: [product],
            page: 1,
            per_page: 1,
            total: 1,
            total_pages: 1,
          });
          setFetchStatus(FetchStatus.OK);
          setCurrentPage(1);
        } catch (e) {
          if (e instanceof NotFound) {
            setFetchStatus(FetchStatus.NOT_FOUND);
          } else {
            setFetchStatus(FetchStatus.ERROR);
          }
        }
      }
    };
    setFetchStatus(FetchStatus.LOADING);
    getProdcuts();
  }, [currentPage, postPerPage, poductsRepo, idFilter]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (idFilter.length > 0) {
      params.set("id", idFilter);
    } else {
      params.set("page", currentPage.toString());
    }
    setSearchParams(params);
  }, [currentPage, idFilter]);

  return {
    products: productsWithPagination?.data,
    total_pages: productsWithPagination?.total_pages,
    currentPage,
    setCurrentPage,
    setIdFilter: handleFilterChange,
    fetchStatus,
    idFilter,
  };
};

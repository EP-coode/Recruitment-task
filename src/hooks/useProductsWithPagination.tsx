import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { FetchStatus } from "../common/fetchStatus";
import { NotFound } from "../errors/NotFound";
import { Pagination } from "../model/Pagination";
import { Product } from "../model/Product";
import { IProductRepository } from "../repositories/IProductRepository";
import { parsePage } from "../utils/parseParams";
import { debounce } from "../utils/debounce";

const DEFAULT_PRODUCT_PER_PAGE = 5;
const DEFAULT_PAGE = 1;

/*
  In future this might be more useful as a Context
*/
export const useProductsWithPagination = (
  poductsRepo: IProductRepository,
  postPerPage: number
) => {
  postPerPage = postPerPage <= 1 ? DEFAULT_PRODUCT_PER_PAGE : postPerPage;

  const [searchParams, setSearchParams] = useSearchParams();
  const [idFilter, setIdFilter] = useState(searchParams.get("id") ?? "");
  const [currentPage, setCurrentPage] = useState(
    parsePage(searchParams.get("page"), DEFAULT_PAGE)
  );
  const [productsWithPagination, setPorductsWithPagination] =
    useState<Pagination<Product> | null>(null);
  const [fetchStatus, setFetchStatus] = useState(FetchStatus.IDDLE);

  const debouncedSetIdFilter = useCallback(
    debounce((filterId: string) => {
      setIdFilter(filterId);
    }, 800),
    []
  );

  const handleFilterChange = (idFilter: string) => {
    debouncedSetIdFilter(idFilter);
  };

  /* 
    Idea of filtering by id is at least strange. 
    Especialy if we have diffrent response type
    when using id (same as /product/:id).
  */
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      if (idFilter.length <= 0) {
        try {
          const porductsWithPagination =
            await poductsRepo.getProductsPagination(currentPage, postPerPage);
            
          if (isMounted) {
            setPorductsWithPagination(porductsWithPagination);
            setFetchStatus(FetchStatus.OK);
          }
        } catch (e) {
          if (!isMounted) return;

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

          if (isMounted) {
            setFetchStatus(FetchStatus.OK);
            setCurrentPage(1);
          }
        } catch (e) {
          if (!isMounted) return;

          if (e instanceof NotFound) {
            setFetchStatus(FetchStatus.NOT_FOUND);
          } else {
            setFetchStatus(FetchStatus.ERROR);
          }
        }
      }
    };
    setFetchStatus(FetchStatus.LOADING);
    fetchProducts();
  }, [currentPage, postPerPage, poductsRepo, idFilter]);

  /*
    This is bad becouse if we will change params somwhere 
    else in program we may occure conflict.
    POSSIBLE SOLLUTION: Wrap it in global context. 
  */
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

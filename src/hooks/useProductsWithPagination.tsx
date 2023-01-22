import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { FetchStatus } from "../common/fetchStatus";
import { NotFound } from "../errors/NotFound";
import { Pagination } from "../model/Pagination";
import { Product } from "../model/Product";
import { IProductRepository } from "../repositories/IProductRepository";
import { isValidId, parsePage } from "../utils/parsing";
import { debounce } from "../utils/debounce";

const DEFAULT_ITEMS_PER_PAGE = 5;
const DEFAULT_PAGE = 1;

/*
  In future this might be more useful as a Context
*/
export const useProductsWithPagination = (
  productsRepository: IProductRepository,
  itemsPerPage: number
) => {
  // params parsing/validatio
  itemsPerPage = itemsPerPage <= 1 ? DEFAULT_ITEMS_PER_PAGE : itemsPerPage;
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parsePage(searchParams.get("page"), DEFAULT_PAGE);
  const id = searchParams.get("id");
  const initialIdFilter = id && isValidId(id) ? parseInt(id) : null;

  // state
  const [idFilter, setIdFilter] = useState<number | null>(initialIdFilter);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [productsWithPagination, setPorductsWithPagination] =
    useState<Pagination<Product> | null>(null);
  const [fetchStatus, setFetchStatus] = useState(FetchStatus.IDDLE);

  const debouncedSetIdFilter = useCallback(
    debounce((filterId: number | null) => {
      setIdFilter(filterId);
    }, 800),
    []
  );

  const handleFilterChange = (idFilter: number | null) => {
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
      if (!idFilter) {
        try {
          const porductsWithPagination =
            await productsRepository.getProductsPagination(
              currentPage,
              itemsPerPage
            );

          if (porductsWithPagination.total_pages < currentPage) {
            setCurrentPage(porductsWithPagination.total_pages);
            return;
          }

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
          const product = await productsRepository.getProductById(idFilter);

          if (isMounted) {
            setPorductsWithPagination({
              data: [product],
              page: 1,
              per_page: 1,
              total: 1,
              total_pages: 1,
            });
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

    return () => {
      isMounted = false;
    };
  }, [currentPage, itemsPerPage, productsRepository, idFilter]);

  /*
    This is bad becouse if we will change params somwhere 
    else in program we may occure conflict.
    POSSIBLE SOLLUTION: Wrap it in global context. 
  */
  useEffect(() => {
    const params = new URLSearchParams();
    if (idFilter) {
      params.set("id", idFilter.toString());
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

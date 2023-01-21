import { NotFound } from "../errors/NotFound";
import { Pagination } from "../model/Pagination";
import { Product } from "../model/Product";
import { IProductRepository } from "./IProductRepository";

// TODO: move to .env
const PRODUCT_SERVICE_ENDPOINT = "https://reqres.in/api/products";

// TODO: add class-validator/class-transformer, error handling
export const productRepository: IProductRepository = {
  getProductById: async function (id: number): Promise<Product> {
    const requestRes = await fetch(`${PRODUCT_SERVICE_ENDPOINT}/${id}`);
    if (requestRes.status == 404) {
      throw new NotFound();
    }
    const data = await requestRes.json();
    return data.data as Promise<Product>;
  },
  getProductsPagination: async function (
    page: number,
    per_page: number
  ): Promise<Pagination<Product>> {
    const requestRes = await fetch(
      `${PRODUCT_SERVICE_ENDPOINT}?page=${page}&per_page=${per_page}`
    );
    if (requestRes.status == 404) {
      throw new NotFound();
    }
    const data = (await requestRes.json()) as Promise<Pagination<Product>>;
    return data;
  },
};

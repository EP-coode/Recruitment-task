import { Pagination } from "../model/Pagination";
import { Product } from "../model/Product";

export interface IProductRepository {
  getProductById(id: number): Promise<Product>;
  getProductsPagination(page: number, per_page: number): Promise<Pagination<Product>>;
}

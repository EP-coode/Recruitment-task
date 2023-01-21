import { Pagination } from "../model/Pagination";
import { Product } from "../model/Product";

// this pattern makes us independent of fetch api, but 
// it makes hard to abort request
export interface IProductRepository {
  getProductById(id: number): Promise<Product>;
  getProductsPagination(page: number, per_page: number): Promise<Pagination<Product>>;
}

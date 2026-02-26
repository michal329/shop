import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product, PageResponse } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // API base URL (from environment)
  private apiUrl = `${environment.apiUrl}/Products`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/Products
   *
   * IMPORTANT — how the API works (from ProductsServices.cs):
   *   position = page number, 1-based  (API does: Skip((position-1) * skip))
   *   skip     = page size             (how many items to return)
   *
   * The API returns 204 NoContent when there are no results,
   * so we use { observe: 'response' } in the component if we need that,
   * but for normal use Observable<PageResponse<Product>> is fine.
   */
  getProducts(
    position: number = 1,
    skip: number = 12,
    categoryIds?: number[],
    description?: string,
    minPrice?: number,
    maxPrice?: number
  ): Observable<PageResponse<Product>> {
    let params = new HttpParams()
      .set('position', position.toString())
      .set('skip', skip.toString());

    if (categoryIds && categoryIds.length > 0) {
      categoryIds.forEach(id => {
        params = params.append('categoryIds', id.toString());
      });
    }
    if (description && description.trim()) {
      params = params.set('description', description.trim());
    }
    if (minPrice != null) {
      params = params.set('minPrice', minPrice.toString());
    }
    if (maxPrice != null) {
      params = params.set('maxPrice', maxPrice.toString());
    }

    // Observe the full response so we can handle 204 No Content gracefully.
    return this.http.get<PageResponse<Product>>(this.apiUrl, { params, observe: 'response' as const }).pipe(
      map(resp => {
        // If the API returns 204 No Content, resp.body will be null — return an empty page response instead.
        if (!resp.body) {
          return {
            data: [] as Product[],
            totalItems: 0,
            currentPage: position,
            pageSize: skip,
            hasPreviousPage: false,
            hasNextPage: false
          } as PageResponse<Product>;
        }
        return resp.body as PageResponse<Product>;
      })
    );
  }

  // NOTE: GET /api/Products/{id} is commented out in ProductsController.
  // Once person 2 uncomments it on the API side, replace the stub below:
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}
import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { BehaviorSubject, combineLatest, EMPTY, Observable, Subject, Subscription } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  // products$ : Observable<Product[]> = combineLatest([ this.productService.productsWithCategory$, this.categorySelectedAction$.pipe(startWith(0))])
  products$ : Observable<Product[]> = combineLatest([ this.productService.productsWithAdd$, this.categorySelectedAction$])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product => selectedCategoryId? product.categoryId === selectedCategoryId : true)
      ),
      catchError(err => {
        this.errorMessage = err;
        return EMPTY; // return of([])
      }),
    );
  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );



  constructor(private productService: ProductService,
              private productCategoryService: ProductCategoryService) { }

  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}

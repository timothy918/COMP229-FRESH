import { Component, OnInit } from '@angular/core';

import { StorageService } from 'src/app/_services/storage.service';

import { Product } from 'src/app/models/product.model';

import { ProductService } from 'src/app/services/product.service';

import { Subscription } from 'rxjs';

import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-products-list',

  templateUrl: './products-list.component.html',

  styleUrls: ['./products-list.component.css'],
})
export class ProductsListComponent implements OnInit {
  products?: Product[];

  currentProduct: Product = {};

  currentIndex = -1;

  name = '';

  private roles: string[] = [];

  isLoggedIn = false;

  showAdminBoard = false;

  showModeratorBoard = false;

  username?: string;

  searchSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private storageService: StorageService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.retrieveProducts();

    this.isLoggedIn = this.storageService.isLoggedIn();

    this.searchSubscription = this.searchService.searchObservable.subscribe(
      (name) => {
        this.searchName(name);
      }
    );

    if (this.isLoggedIn) {
      const user = this.storageService.getUser();

      this.roles = user.roles;

      this.showAdminBoard = this.roles.includes('ROLE_ADMIN');

      this.showModeratorBoard = this.roles.includes('ROLE_MODERATOR');

      //this.username = user.username;
    }
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  retrieveProducts(): void {
    this.productService
      .getAll()

      .subscribe({
        next: (data) => {
          this.products = data;

          console.log(data);
        },

        error: (e) => console.error(e),
      });
  }

  refreshList(): void {
    this.retrieveProducts();

    this.currentProduct = {};

    this.currentIndex = -1;
  }

  setActiveProduct(product: Product, index: number): void {
    this.currentProduct = product;

    this.currentIndex = index;
  }

  removeAllProducts(): void {
    this.productService
      .deleteAll()

      .subscribe({
        next: (res) => {
          console.log(res);

          this.refreshList();
        },

        error: (e) => console.error(e),
      });
  }

  searchName(name: string): void {
    this.name = name;
    this.currentProduct = {};
    this.currentIndex = -1;

    this.productService.findByName(name).subscribe({
      next: (data: Product[] | undefined) => {
        this.products = data;
        console.log(data);
      },
      error: (e: any) => console.error(e),
    });
  }
}

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    {
      id: 1,
      name: 'Laptop Pro 15',
      description: 'High-performance laptop with 15-inch display',
      price: 1299.99,
      category: 'Electronics',
      stock: 45,
      createdAt: new Date('2024-01-10')
    },
    {
      id: 2,
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking',
      price: 29.99,
      category: 'Accessories',
      stock: 150,
      createdAt: new Date('2024-02-15')
    },
    {
      id: 3,
      name: 'USB-C Hub',
      description: '7-in-1 USB-C hub with multiple ports',
      price: 49.99,
      category: 'Accessories',
      stock: 80,
      createdAt: new Date('2024-03-01')
    },
    {
      id: 4,
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with blue switches',
      price: 89.99,
      category: 'Accessories',
      stock: 60,
      createdAt: new Date('2024-03-20')
    },
    {
      id: 5,
      name: '4K Monitor 27"',
      description: '27-inch 4K UHD monitor with HDR support',
      price: 399.99,
      category: 'Electronics',
      stock: 30,
      createdAt: new Date('2024-04-05')
    },
    {
      id: 6,
      name: 'Webcam HD',
      description: '1080p HD webcam with noise-canceling microphone',
      price: 79.99,
      category: 'Electronics',
      stock: 95,
      createdAt: new Date('2024-04-18')
    }
  ];

  getProducts(): Observable<Product[]> {
    return of(this.products).pipe(delay(300));
  }

  getProductById(id: number): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === id);
    return of(product).pipe(delay(200));
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    const filtered = this.products.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
    return of(filtered).pipe(delay(300));
  }
}

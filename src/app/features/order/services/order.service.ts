import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders: Order[] = [
    {
      id: 1001,
      customerId: 1,
      customerName: 'John Doe',
      orderDate: new Date('2024-06-01'),
      status: 'Delivered',
      items: [
        { productId: 1, productName: 'Laptop Pro 15', quantity: 1, price: 1299.99 },
        { productId: 2, productName: 'Wireless Mouse', quantity: 2, price: 29.99 }
      ],
      totalAmount: 1359.97,
      shippingAddress: '123 Main St, New York, NY 10001'
    },
    {
      id: 1002,
      customerId: 2,
      customerName: 'Jane Smith',
      orderDate: new Date('2024-06-05'),
      status: 'Shipped',
      items: [
        { productId: 4, productName: 'Mechanical Keyboard', quantity: 1, price: 89.99 },
        { productId: 3, productName: 'USB-C Hub', quantity: 1, price: 49.99 }
      ],
      totalAmount: 139.98,
      shippingAddress: '456 Oak Ave, Los Angeles, CA 90001'
    },
    {
      id: 1003,
      customerId: 1,
      customerName: 'John Doe',
      orderDate: new Date('2024-06-10'),
      status: 'Processing',
      items: [
        { productId: 5, productName: '4K Monitor 27"', quantity: 1, price: 399.99 }
      ],
      totalAmount: 399.99,
      shippingAddress: '123 Main St, New York, NY 10001'
    },
    {
      id: 1004,
      customerId: 3,
      customerName: 'Robert Johnson',
      orderDate: new Date('2024-06-12'),
      status: 'Pending',
      items: [
        { productId: 6, productName: 'Webcam HD', quantity: 1, price: 79.99 },
        { productId: 2, productName: 'Wireless Mouse', quantity: 1, price: 29.99 }
      ],
      totalAmount: 109.98,
      shippingAddress: '789 Pine Rd, Chicago, IL 60601'
    },
    {
      id: 1005,
      customerId: 4,
      customerName: 'Emily Davis',
      orderDate: new Date('2024-06-15'),
      status: 'Delivered',
      items: [
        { productId: 1, productName: 'Laptop Pro 15', quantity: 1, price: 1299.99 },
        { productId: 4, productName: 'Mechanical Keyboard', quantity: 1, price: 89.99 },
        { productId: 2, productName: 'Wireless Mouse', quantity: 1, price: 29.99 }
      ],
      totalAmount: 1419.97,
      shippingAddress: '321 Elm St, Houston, TX 77001'
    },
    {
      id: 1006,
      customerId: 5,
      customerName: 'Michael Wilson',
      orderDate: new Date('2024-06-18'),
      status: 'Shipped',
      items: [
        { productId: 5, productName: '4K Monitor 27"', quantity: 2, price: 399.99 }
      ],
      totalAmount: 799.98,
      shippingAddress: '654 Maple Dr, Phoenix, AZ 85001'
    }
  ];

  getOrders(): Observable<Order[]> {
    return of(this.orders).pipe(delay(300));
  }

  getOrderById(id: number): Observable<Order | undefined> {
    const order = this.orders.find(o => o.id === id);
    return of(order).pipe(delay(200));
  }

  getOrdersByCustomerId(customerId: number): Observable<Order[]> {
    const filtered = this.orders.filter(o => o.customerId === customerId);
    return of(filtered).pipe(delay(300));
  }
}

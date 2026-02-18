import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customers: Customer[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0101',
      address: '123 Main St, New York, NY 10001',
      createdAt: new Date('2024-01-15'),
      totalOrders: 5
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0102',
      address: '456 Oak Ave, Los Angeles, CA 90001',
      createdAt: new Date('2024-02-20'),
      totalOrders: 3
    },
    {
      id: 3,
      name: 'Robert Johnson',
      email: 'robert.j@example.com',
      phone: '+1-555-0103',
      address: '789 Pine Rd, Chicago, IL 60601',
      createdAt: new Date('2024-03-10'),
      totalOrders: 8
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+1-555-0104',
      address: '321 Elm St, Houston, TX 77001',
      createdAt: new Date('2024-04-05'),
      totalOrders: 2
    },
    {
      id: 5,
      name: 'Michael Wilson',
      email: 'michael.w@example.com',
      phone: '+1-555-0105',
      address: '654 Maple Dr, Phoenix, AZ 85001',
      createdAt: new Date('2024-05-12'),
      totalOrders: 6
    }
  ];

  getCustomers(): Observable<Customer[]> {
    // Simulate API call with delay
    return of(this.customers).pipe(delay(300));
  }

  getCustomerById(id: number): Observable<Customer | undefined> {
    const customer = this.customers.find(c => c.id === id);
    return of(customer).pipe(delay(200));
  }

  createCustomer(customer: Customer): Observable<Customer> {
    // Simulate API call with delay
    this.customers.push(customer);
    return of(customer).pipe(delay(500));
  }
}

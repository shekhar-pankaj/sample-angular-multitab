import { Component, OnInit, OnDestroy } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../models/customer.model';
import { TabManagerService } from '../../../core/services/tab-manager.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit, OnDestroy {
  customers: Customer[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private customerService: CustomerService,
    private tabManager: TabManagerService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customers) => {
          this.customers = customers;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading customers:', error);
          this.loading = false;
        }
      });
  }

  openCustomerDetail(customer: Customer): void {
    this.tabManager.openTab(
      `Customer: ${customer.name}`,
      `/customers/${customer.id}`,
      true // Reuse tab if already open
    );
  }
}

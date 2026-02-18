import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../models/customer.model';
import { TabManagerService } from '../../../core/services/tab-manager.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss']
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
  customer: Customer | null = null;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private tabManager: TabManagerService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = +params['id'];
        this.loadCustomer(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCustomer(id: number): void {
    this.loading = true;
    this.customerService.getCustomerById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customer) => {
          this.customer = customer || null;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading customer:', error);
          this.loading = false;
        }
      });
  }

  viewOrders(): void {
    if (this.customer) {
      this.tabManager.openTab(
        `Orders - ${this.customer.name}`,
        `/orders?customerId=${this.customer.id}`,
        true
      );
    }
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order.model';
import { TabManagerService } from '../../../core/services/tab-manager.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  filterCustomerId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private tabManager: TabManagerService
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.filterCustomerId = params['customerId'] ? +params['customerId'] : null;
        this.loadOrders();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.loading = true;

    const source$ = this.filterCustomerId
      ? this.orderService.getOrdersByCustomerId(this.filterCustomerId)
      : this.orderService.getOrders();

    source$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.loading = false;
        }
      });
  }

  openOrderDetail(order: Order): void {
    this.tabManager.openTab(
      `Order #${order.id}`,
      `/orders/${order.id}`,
      true
    );
  }

  openCustomerDetail(order: Order): void {
    this.tabManager.openTab(
      `Customer: ${order.customerName}`,
      `/customers/${order.customerId}`,
      true
    );
  }
}

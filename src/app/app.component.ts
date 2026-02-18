import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabManagerService } from './core/services/tab-manager.service';
import { TabState } from './core/models/tab.model';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  tabs: TabState[] = [];
  activeTabId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    public tabManager: TabManagerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to tabs changes
    this.tabManager.tabs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tabs => {
        this.tabs = tabs;
      });

    // Subscribe to active tab changes
    this.tabManager.activeTabId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activeTabId => {
        this.activeTabId = activeTabId;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabClick(tab: TabState): void {
    this.tabManager.activateTab(tab.id);
  }

  onTabClose(event: Event, tab: TabState): void {
    event.stopPropagation();
    this.tabManager.closeTab(tab.id);
  }

  openCustomers(): void {
    this.tabManager.openTab('Customers', '/customers', true);
  }

  openProducts(): void {
    this.tabManager.openTab('Products', '/products', true);
  }

  openOrders(): void {
    this.tabManager.openTab('Orders', '/orders', true);
  }

  closeAllTabs(): void {
    if (confirm('Are you sure you want to close all tabs?')) {
      this.tabManager.closeAllTabs();
    }
  }

  isActiveTab(tabId: string): boolean {
    return tabId === this.activeTabId;
  }
}

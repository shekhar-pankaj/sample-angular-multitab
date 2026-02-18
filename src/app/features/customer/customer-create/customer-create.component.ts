import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { TabManagerService } from '../../../core/services/tab-manager.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-customer-create',
  templateUrl: './customer-create.component.html',
  styleUrls: ['./customer-create.component.scss']
})
export class CustomerCreateComponent implements OnInit, OnDestroy {
  customerForm!: FormGroup;
  submitted = false;
  private destroy$ = new Subject<void>();
  private currentTabId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private tabManager: TabManagerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current tab ID
    const activeTab = this.tabManager.getActiveTab();
    this.currentTabId = activeTab?.id || null;

    // Initialize form
    this.initializeForm();

    // Restore form state if exists
    this.restoreFormState();
  }

  ngOnDestroy(): void {
    // Save form state before destroying
    this.saveFormState();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s-()]+$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Save form state on every change
    this.customerForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.saveFormState();
      });
  }

  private saveFormState(): void {
    if (this.currentTabId) {
      const state = {
        formValue: this.customerForm.value,
        submitted: this.submitted
      };
      this.tabManager.saveTabState(this.currentTabId, state);
    }
  }

  private restoreFormState(): void {
    if (this.currentTabId) {
      const savedState = this.tabManager.getTabState(this.currentTabId);
      if (savedState) {
        this.customerForm.patchValue(savedState.formValue);
        this.submitted = savedState.submitted || false;
      }
    }
  }

  get f() {
    return this.customerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.customerForm.invalid) {
      return;
    }

    const customerData = {
      ...this.customerForm.value,
      id: Date.now(), // Generate temporary ID
      createdAt: new Date(),
      totalOrders: 0
    };

    // Simulate API call
    this.customerService.createCustomer(customerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customer) => {
          // Clear saved state
          if (this.currentTabId) {
            this.tabManager.saveTabState(this.currentTabId, null);
          }
          
          // Navigate to customer list or detail
          this.tabManager.openTab('Customers', '/customers', true);
        },
        error: (error) => {
          console.error('Error creating customer:', error);
        }
      });
  }

  onReset(): void {
    this.customerForm.reset();
    this.submitted = false;
    this.saveFormState();
  }

  onCancel(): void {
    this.router.navigate(['/customers']);
  }
}

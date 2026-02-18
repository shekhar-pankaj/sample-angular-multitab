import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { TabManagerService } from '../../../core/services/tab-manager.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss']
})
export class ProductCreateComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  submitted = false;
  categories = ['Electronics', 'Accessories', 'Software', 'Hardware', 'Peripherals'];
  private destroy$ = new Subject<void>();
  private currentTabId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
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
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      category: ['Electronics', [Validators.required]],
      stock: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]]
    });

    // Save form state on every change
    this.productForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.saveFormState();
      });
  }

  private saveFormState(): void {
    if (this.currentTabId) {
      const state = {
        formValue: this.productForm.value,
        submitted: this.submitted
      };
      this.tabManager.saveTabState(this.currentTabId, state);
    }
  }

  private restoreFormState(): void {
    if (this.currentTabId) {
      const savedState = this.tabManager.getTabState(this.currentTabId);
      if (savedState) {
        this.productForm.patchValue(savedState.formValue);
        this.submitted = savedState.submitted || false;
      }
    }
  }

  get f() {
    return this.productForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.productForm.invalid) {
      return;
    }

    const productData = {
      ...this.productForm.value,
      id: Date.now(), // Generate temporary ID
      price: parseFloat(this.productForm.value.price),
      stock: parseInt(this.productForm.value.stock, 10),
      createdAt: new Date()
    };

    // Simulate API call
    this.productService.createProduct(productData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          // Clear saved state
          if (this.currentTabId) {
            this.tabManager.saveTabState(this.currentTabId, null);
          }
          
          // Navigate to product list or detail
          this.tabManager.openTab('Products', '/products', true);
        },
        error: (error) => {
          console.error('Error creating product:', error);
        }
      });
  }

  onReset(): void {
    this.productForm.reset({
      category: 'Electronics' // Reset to default category
    });
    this.submitted = false;
    this.saveFormState();
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }
}

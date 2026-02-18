import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductRoutingModule } from './product-routing.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductCreateComponent } from './product-create/product-create.component';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductDetailComponent,
    ProductCreateComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProductRoutingModule
  ]
})
export class ProductModule { }

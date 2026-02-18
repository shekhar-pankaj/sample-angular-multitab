import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';
import { CustomerCreateComponent } from './customer-create/customer-create.component';

const routes: Routes = [
  { path: '', component: CustomerListComponent },
  { path: 'create', component: CustomerCreateComponent },
  { path: ':id', component: CustomerDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }

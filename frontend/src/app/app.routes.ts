import { Routes } from '@angular/router';
import { PetListComponent } from './pets/pet-list/pet-list.component';
import { PetDetailComponent } from './pets/pet-detail/pet-detail.component';
import { PetAdoptComponent } from './pets/pet-adopt/pet-adopt';
import { AdminPageComponent } from './admin/admin-page/admin-page.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { PetFormComponent } from './pets/pet-form/pet-form';
import { adminGuard } from './admin/admin.guard';
import { AdminRequestsComponent } from './admin/admin-requests/admin-requests.component';
import { AdminDonationsComponent } from './admin/admin-donations/admin-donations.component';
import { DonateComponent } from './donate/donate.component';

export const routes: Routes = [
  { path: '', component: PetListComponent },
  { path: 'pets/:id', component: PetDetailComponent },
  { path: 'pets/:id/adopt', component: PetAdoptComponent },
  { path: 'donate', component: DonateComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  // หน้าเจ้าหน้าที่ทั้งหมดต้องกรอกรหัสผ่านก่อน (adminGuard)
  { path: 'admin', component: AdminPageComponent, canActivate: [adminGuard] },
  { path: 'admin/new', component: PetFormComponent, canActivate: [adminGuard] },
  { path: 'admin/requests', component: AdminRequestsComponent, canActivate: [adminGuard] },
  { path: 'admin/donations', component: AdminDonationsComponent, canActivate: [adminGuard] },
  { path: 'admin/:id/edit', component: PetFormComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' },
];

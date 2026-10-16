import { Routes } from '@angular/router';
import { PetListComponent } from './pets/pet-list/pet-list.component';
import { PetDetailComponent } from './pets/pet-detail/pet-detail.component';
import { PetAdoptComponent } from './pets/pet-adopt/pet-adopt';
import { AdminPageComponent } from './admin/admin-page/admin-page.component';
import { PetFormComponent } from './pets/pet-form/pet-form';
import { AdminRequestsComponent } from './admin/admin-requests/admin-requests.component';
import { AdminDonationsComponent } from './admin/admin-donations/admin-donations.component';
import { AdminLogsComponent } from './admin/admin-logs/admin-logs.component';
import { AdminAccountsComponent } from './admin/admin-accounts/admin-accounts.component';
import { DonateComponent } from './donate/donate.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MyRequestsComponent } from './auth/my-requests/my-requests.component';
import { adminGuard, authGuard } from './auth/auth.guards';

export const routes: Routes = [
  { path: '', component: PetListComponent },
  { path: 'pets/:id', component: PetDetailComponent },
  // ส่งคำขอรับเลี้ยงต้องเป็นสมาชิก เพื่อให้กลับมาติดตามสถานะได้
  { path: 'pets/:id/adopt', component: PetAdoptComponent, canActivate: [authGuard] },
  { path: 'donate', component: DonateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'my-requests', component: MyRequestsComponent, canActivate: [authGuard] },
  { path: 'admin-login', redirectTo: 'login' },
  // หน้าเจ้าหน้าที่ทั้งหมด ต้องเข้าสู่ระบบด้วยบัญชีที่เป็น ADMIN
  { path: 'admin', component: AdminPageComponent, canActivate: [adminGuard] },
  { path: 'admin/new', component: PetFormComponent, canActivate: [adminGuard] },
  { path: 'admin/requests', component: AdminRequestsComponent, canActivate: [adminGuard] },
  { path: 'admin/donations', component: AdminDonationsComponent, canActivate: [adminGuard] },
  { path: 'admin/logs', component: AdminLogsComponent, canActivate: [adminGuard] },
  { path: 'admin/accounts', component: AdminAccountsComponent, canActivate: [adminGuard] },
  { path: 'admin/:id/edit', component: PetFormComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' },
];

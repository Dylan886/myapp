import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {AdminComponent} from './admin/admin.component';
import {TeacherComponent} from './teacher/teacher.component';
import {ErrorComponent} from './error/error.component';
import {TryComponent} from './try/try.component';
import {CompileComponent} from './compile/compile.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: 'admin', component: AdminComponent},
  { path: 'compile', component: CompileComponent},
  { path: 'teacher', component: TeacherComponent},
  { path: '', redirectTo: '/teacher', pathMatch: 'full' },
  {path: '**', component: ErrorComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

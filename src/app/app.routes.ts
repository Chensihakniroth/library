import { Routes } from '@angular/router';
import { Home } from './home/home';
import { AddBook } from './add-book/add-book';
import { ConfirmOtp } from './confirm-otp/confirm-otp';
import { ForgetPassword } from './forget-password/forget-password';
import { Login } from './login/login';
import { Register } from './register/register';
import { SendOtp } from './send-otp/send-otp';
import { UpdateBook } from './update-book/update-book';    

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'add-book', component: AddBook },
  { path: 'confirm-otp', component: ConfirmOtp },
  { path: 'forget-password', component: ForgetPassword },
  { path: '', component: Login },
  { path: 'register', component: Register },
  { path: 'send-otp', component: SendOtp },
  { path: 'update-book', component: UpdateBook }
];

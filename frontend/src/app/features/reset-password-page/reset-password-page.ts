import { Component } from '@angular/core';
import { LoginProjetDescrip } from '../../shared/components/login-projet-descrip/login-projet-descrip';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password-page',
  imports: [LoginProjetDescrip,RouterModule],
  templateUrl: './reset-password-page.html',
  styleUrl: './reset-password-page.css',
})
export class ResetPasswordPage {

}

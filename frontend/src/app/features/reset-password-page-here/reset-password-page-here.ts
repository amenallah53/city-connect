import { Component } from '@angular/core';
import { LoginProjetDescrip } from '../../shared/components/login-projet-descrip/login-projet-descrip';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password-page-here',
  imports: [RouterModule,LoginProjetDescrip],
  templateUrl: './reset-password-page-here.html',
  styleUrl: './reset-password-page-here.css',
})
export class ResetPasswordPageHere {

}

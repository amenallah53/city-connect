import { Component } from '@angular/core';
import { LoginProjetDescrip } from '../../shared/components/login-projet-descrip/login-projet-descrip';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-create-account',
  imports: [LoginProjetDescrip,RouterModule],
  templateUrl: './create-account.html',
  styleUrl: './create-account.css',
})
export class CreateAccount {

}

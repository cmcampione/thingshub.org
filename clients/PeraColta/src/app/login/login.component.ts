import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public username = '';
  public password = '';
  public remember = this.accountService.remember;

  constructor(private accountService: AccountService,
    public toastController: ToastController) {
  }

  ngOnInit() {
  }

  public async login() {
    try {
      if (!this.username || !this.password) {
        const toast = await this.toastController.create({
          message: 'Incorrect username or password',
          duration: 2000
        });
        toast.present();
        return;
      }
      const loginData = await this.accountService.login(this.username, this.password, this.remember);
    }
    catch (e) {
      // ToDo: May be need to reset ngrx State
      this.username = '';
      const msg = (e instanceof Error) ? e.message : e.data.message;
      const toast = await this.toastController.create({
        message: msg,
        duration: 2000
      });
      toast.present();
    }
    finally {
      this.password = '';
    }
  }
}

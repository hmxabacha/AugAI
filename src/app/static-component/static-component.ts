import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule, Router } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-static-component',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './static-component.html',
  styleUrl: './static-component.css'
})
export class StaticComponent {

  constructor(private authService: AuthService,private router: Router, private snackBar : MatSnackBar){}

  signOut(){

    this.authService.logout();
    this.snackBar.open('You are logged out !' , 'Close',{
      duration:3000,
      verticalPosition:'top',
    });
      this.clearSession();
      this.router.navigate(['/login']).then(() => {
        window.history.replaceState({}, '', '/login');
      });
    }
    clearSession() {
      sessionStorage.removeItem('token'); // or whatever you store
    }

  dropdownOpen = false;
    //  signOut(){
    //   this.router.navigate(['login']);
    //  }
     toggleDropdown(){
      this.dropdownOpen = !this.dropdownOpen;
     }
}

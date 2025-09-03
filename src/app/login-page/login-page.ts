import { Component } from '@angular/core';
import { routes } from '../app.routes';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterModule ,FormsModule ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  email : string ='';
  password: string ='';
  constructor(private authService: AuthService, private http : HttpClient , private router : Router, private snackBar: MatSnackBar){

  }
  ngOnInit(){
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home/AugAi']); // redirect away
      console.log("sign out to go to login page !");
    }
  }

  showAlert() {
    this.snackBar.open('You are logged in!', 'Close', {
      duration: 3000,
      verticalPosition: 'top',

    });
    this.router.navigate(['home/AugAi']);
  }
  // goHome(){
  //   this.router.navigate(['home']);
  // }
  onLogin(token: string){
    this.authService.setToken(token);
    this.router.navigate(['/home']).then(() => {
      // Replace history so user can’t go back to login
      window.history.replaceState({}, '', '/home');
    });
  }
  login() {
  this.http.post('http://localhost:5077/api/login/login', {
    email: this.email,
    password: this.password
  }).subscribe({
    next: (res: any) => {
      // Use the real token from backend
      if (res && res.token) {
        this.onLogin(res.token);


        this.showAlert();
      } else {
        alert("No token received from server.");
      }
    },
    error: err => {
      alert("Login failed: " + err.error);
    }
  });
}

}

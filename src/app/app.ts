import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginPage } from './login-page/login-page';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('AugAI');

  constructor() {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.go(1);
    };
  }
}

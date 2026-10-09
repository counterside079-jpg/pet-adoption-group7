import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router'; // 👈 1. import RouterLink และ RouterOutlet

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink], // 👈 2. ใส่ RouterLink ลงใน array imports ตรงนี้
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'frontend';
}
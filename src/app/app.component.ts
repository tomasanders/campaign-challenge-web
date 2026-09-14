import { Component } from '@angular/core';

import { ParticipantSignupComponent } from './participant-signup/participant-signup.component';

@Component({
  selector: 'app-root',
  imports: [ParticipantSignupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}

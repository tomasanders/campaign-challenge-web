import { Routes } from '@angular/router';

import { ParticipantSignupComponent } from './participant-signup/participant-signup.component';
import { TicTacToeComponent } from './tic-tac-toe/tic-tac-toe.component';

export const routes: Routes = [
	{ path: '', component: ParticipantSignupComponent },
	{ path: 'game/:participantId', component: TicTacToeComponent },
	{ path: '**', redirectTo: '' }
];

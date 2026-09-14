import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreateParticipantPayload,
  Participant,
  SignupResponse
} from '../models/participant.model';

@Injectable({ providedIn: 'root' })
export class ParticipantApiService {
  private readonly http = inject(HttpClient);
  private readonly participantsUrl = `${environment.apiBaseUrl}/api/v1/participants`;

  getParticipants(): Observable<Participant[]> {
    return this.http.get<Participant[]>(this.participantsUrl);
  }

  createParticipant(payload: CreateParticipantPayload): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(this.participantsUrl, payload);
  }
}

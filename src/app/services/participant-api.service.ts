import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreateParticipantPayload,
  Participant,
  SignupResponse
} from '../models/participant.model';
import { CreateScorePayload, ScoreResponse } from '../models/score.model';

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

  getScore(participantId: number): Observable<ScoreResponse> {
    return this.http.get<ScoreResponse>(`${this.participantsUrl}/${participantId}/scores`);
  }

  submitScore(participantId: number, payload: CreateScorePayload): Observable<ScoreResponse> {
    return this.http.post<ScoreResponse>(`${this.participantsUrl}/${participantId}/scores`, payload);
  }
}

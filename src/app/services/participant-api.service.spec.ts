import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ParticipantApiService } from './participant-api.service';

describe('ParticipantApiService', () => {
  let service: ParticipantApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ParticipantApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ParticipantApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets the bare participant array', () => {
    service.getParticipants().subscribe((participants) => expect(participants).toEqual([]));
    const request = http.expectOne('http://localhost:3000/api/v1/participants');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('posts the flat signup payload and returns the success envelope', () => {
    const payload = {
      first_name: 'Ava', last_name: 'Martinez', email: 'ava@example.com', age: 29,
      country_code: 'US', marketing_opt_in: false
    };
    service.createParticipant(payload).subscribe((response) => expect(response.message).toBe('Signup successful'));
    const request = http.expectOne('http://localhost:3000/api/v1/participants');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ participant: payload, message: 'Signup successful' }, { status: 201, statusText: 'Created' });
  });

  it('posts a score for a participant', () => {
    const payload = { score: 2, duration_ms: 34_567 };
    service.submitScore(7, payload).subscribe((response) => expect(response.score.score).toBe(2));
    const request = http.expectOne('http://localhost:3000/api/v1/participants/7/scores');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ score: { ...payload, id: 1, participant_id: 7, played_at: '', created_at: '', updated_at: '' } }, { status: 201, statusText: 'Created' });
  });

  it('gets a participant score', () => {
    service.getScore(7).subscribe((response) => expect(response.score.score).toBe(2));
    const request = http.expectOne('http://localhost:3000/api/v1/participants/7/scores');
    expect(request.request.method).toBe('GET');
    request.flush({ score: { id: 1, participant_id: 7, score: 2, duration_ms: 100, played_at: '', created_at: '', updated_at: '' } });
  });

  it('gets the leaderboard', () => {
    service.getLeaderboard().subscribe((response) => expect(response.leaderboard[0].score).toBe(5));
    const request = http.expectOne('http://localhost:3000/api/v1/leaderboard');
    expect(request.request.method).toBe('GET');
    request.flush({ leaderboard: [{ score: 5, first_name: 'Ava', played_at: '' }] });
  });
});

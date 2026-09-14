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
});

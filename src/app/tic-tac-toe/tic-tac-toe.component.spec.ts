import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ParticipantApiService } from '../services/participant-api.service';
import { TicTacToeComponent } from './tic-tac-toe.component';

describe('TicTacToeComponent', () => {
  let fixture: ComponentFixture<TicTacToeComponent>;
  let component: TicTacToeComponent;
  let api: jasmine.SpyObj<ParticipantApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj('ParticipantApiService', ['getLeaderboard', 'getScore', 'submitScore']);
    api.getLeaderboard.and.returnValue(of({ leaderboard: [] }));
    api.getScore.and.returnValue(throwError(() => ({ status: 404 })));
    api.submitScore.and.returnValue(of({ score: {
      id: 1,
      participant_id: 7,
      score: 1,
      duration_ms: 100,
      played_at: '',
      created_at: '',
      updated_at: ''
    } }));
    await TestBed.configureTestingModule({
      imports: [TicTacToeComponent],
      providers: [
        { provide: ParticipantApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(TicTacToeComponent);
    component = fixture.componentInstance;
    spyOn(Math, 'random').and.returnValue(0);
  });

  it('marks the player move and lets the computer answer', () => {
    component.makeMove(0);

    expect(component.board[0]).toBe('X');
    expect(component.board[1]).toBe('O');
    expect(api.submitScore).not.toHaveBeenCalled();
  });

  it('blocks a participant with a saved score', () => {
    api.getScore.and.returnValue(of({ score: {
      id: 1,
      participant_id: 7,
      score: 2,
      duration_ms: 100,
      played_at: '',
      created_at: '',
      updated_at: ''
    } }));
    fixture = TestBed.createComponent(TicTacToeComponent);
    component = fixture.componentInstance;

    component.makeMove(0);

    expect(component.hasSavedScore).toBeTrue();
    expect(component.wins).toBe(2);
    expect(component.board[0]).toBeNull();
    expect(api.submitScore).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.intro')).toBeNull();
  });

  it('renders computer marks as skulls on the board', () => {
    component.board = ['X', 'O', null, null, null, null, null, null, null];
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('.cell');
    expect(cells[1].textContent.trim()).toBe('☠️');
  });

  it('renders the leaderboard below the board', () => {
    api.getLeaderboard.and.returnValue(of({ leaderboard: [
      { score: 5, first_name: 'Ava', played_at: '2026-09-14T12:00:00Z' }
    ] }));
    fixture = TestBed.createComponent(TicTacToeComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.leaderboard').textContent).toContain('Ava');
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('resets the board and score for a new game', () => {
    component.wins = 2;
    component.gameOver = true;
    component.startNewGame();

    expect(component.board).toEqual([null, null, null, null, null, null, null, null, null]);
    expect(component.wins).toBe(0);
    expect(component.gameOver).toBeFalse();
  });

  it('submits one positive score when the computer wins after a previous player win', () => {
    api.getLeaderboard.and.returnValues(
      of({ leaderboard: [] }),
      of({ leaderboard: [{ score: 1, first_name: 'Ava', played_at: '' }] })
    );
    fixture = TestBed.createComponent(TicTacToeComponent);
    component = fixture.componentInstance;
    component.wins = 1;
    component.board = ['O', 'O', null, 'X', null, null, null, null, null];

    (component as unknown as { playComputerMove: () => void }).playComputerMove();

    expect(api.submitScore).toHaveBeenCalledTimes(1);
    expect(api.submitScore).toHaveBeenCalledWith(7, jasmine.objectContaining({ score: 1 }));
    expect(component.hasSavedScore).toBeTrue();
    expect(component.leaderboardNotice).toBe('Your score made the leaderboard!');
    component.startNewGame();
    expect(component.gameOver).toBeTrue();
  });
});

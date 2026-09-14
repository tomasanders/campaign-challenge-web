import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { ParticipantApiService } from '../services/participant-api.service';

type Cell = 'X' | 'O' | null;

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

@Component({
  selector: 'app-tic-tac-toe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tic-tac-toe.component.html',
  styleUrl: './tic-tac-toe.component.css'
})
export class TicTacToeComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ParticipantApiService);

  readonly participantId = Number(this.route.snapshot.paramMap.get('participantId'));
  board: Cell[] = Array<Cell>(9).fill(null);
  wins = 0;
  round = 1;
  gameOver = false;
  isSubmitting = false;
  isCheckingScore = true;
  hasSavedScore = false;
  submissionError = '';
  resultMessage = 'Checking your game status...';
  private readonly gameStartedAt = Date.now();
  private scoreSubmitted = false;

  constructor() {
    this.api.getScore(this.participantId).pipe(
      catchError((error: { status?: number }) => {
        if (error.status === 404) {
          return of(null);
        }

        this.submissionError = 'We could not verify your game status. Please try again.';
        return of({ unavailable: true });
      })
    ).subscribe((response) => {
      this.isCheckingScore = false;
      if (response && 'score' in response) {
        this.hasSavedScore = true;
        this.wins = response.score.score;
        this.gameOver = true;
        this.resultMessage = `You have already finished with a score of ${response.score.score}.`;
      } else if (!response) {
        this.resultMessage = 'Your move. You are X.';
      }
    });
  }

  makeMove(index: number): void {
    if (this.isCheckingScore || this.hasSavedScore || this.gameOver || this.isSubmitting || this.board[index] !== null) {
      return;
    }

    this.board[index] = 'X';
    if (this.hasWinner('X')) {
      this.wins += 1;
      this.startNextRound('Round won. Keep going.');
      return;
    }

    if (this.isTie()) {
      this.startNextRound('Tie game. New round.');
      return;
    }

    this.playComputerMove();
  }

  startNewGame(): void {
    if (this.hasSavedScore) {
      return;
    }

    this.board = Array<Cell>(9).fill(null);
    this.wins = 0;
    this.round = 1;
    this.gameOver = false;
    this.isSubmitting = false;
    this.submissionError = '';
    this.scoreSubmitted = false;
    this.resultMessage = 'Your move. You are X.';
  }

  private playComputerMove(): void {
    const openCells = this.board
      .map((cell, index) => cell === null ? index : -1)
      .filter((index) => index >= 0);
    const index = openCells[Math.floor(Math.random() * openCells.length)];

    this.board[index] = 'O';
    if (this.hasWinner('O')) {
      this.finishGame();
    } else if (this.isTie()) {
      this.startNextRound('Tie game. New round.');
    } else {
      this.resultMessage = 'Your move. You are X.';
    }
  }

  private startNextRound(message: string): void {
    this.round += 1;
    this.board = Array<Cell>(9).fill(null);
    this.resultMessage = message;
  }

  private finishGame(): void {
    this.gameOver = true;
    this.resultMessage = 'The computer won this round.';

    if (this.wins === 0 || this.scoreSubmitted) {
      return;
    }

    this.scoreSubmitted = true;
    this.isSubmitting = true;
    this.api.submitScore(this.participantId, {
      score: this.wins,
      duration_ms: Math.max(1, Date.now() - this.gameStartedAt)
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.hasSavedScore = true;
        this.resultMessage = `Game over. Final score: ${this.wins}.`;
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.submissionError = error.status === 422
          ? 'This score could not be recorded.'
          : 'We could not record your score. Please try again.';
      }
    });
  }

  private hasWinner(mark: 'X' | 'O'): boolean {
    return WINNING_LINES.some(([a, b, c]) =>
      this.board[a] === mark && this.board[b] === mark && this.board[c] === mark
    );
  }

  private isTie(): boolean {
    return this.board.every((cell) => cell !== null);
  }
}

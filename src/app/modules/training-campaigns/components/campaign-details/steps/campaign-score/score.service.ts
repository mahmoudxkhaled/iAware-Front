import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ScoreService {
    private score: number = 0;
    private correctanswers: number = 0;

    setScore(score: number): void {
        this.score = score;
    }

    setNumberOfCorrectAnswers(correctanswers: number): void {
        this.correctanswers = correctanswers;
    }

    getScore(): number {
        return this.score;
    }

    getNumberOfCorrectAnswers(): number {
        return this.correctanswers;
    }
}
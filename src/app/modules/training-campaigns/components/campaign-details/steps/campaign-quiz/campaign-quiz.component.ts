import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { CampaignService } from 'src/app/modules/training-campaigns/services/campaign.service';
import {
    ITrainingLessonQuiz,
    ITrainingLessonQuizAnswer,
} from 'src/app/modules/security-training/models/ISecurityTrainingModel';
import { ScoreService } from '../campaign-score/score.service';
import * as confetti from 'canvas-confetti';


export interface UserQuizAnswerDto {
    scedualUserId: string;
    trainingLessonId: string;
    isUserPassed: any;
    score: any;
    trainingLessonQuizAnswerIds: string[];
}

@Component({
    selector: 'app-campaign-quiz',
    templateUrl: './campaign-quiz.component.html',
    styleUrls: ['./campaign-quiz.component.scss'],
})
export class CampaignQuizComponent implements OnInit {
    quizzes: ITrainingLessonQuiz[];
    currentQuestionIndex: number = 0;
    selectedQuizAnswerIndex: number = -1;
    lessonId: string;
    lessonLanguageId : string;
    campaignId : string;
    scedualUserId: string;

    constructor(
        private router: Router,
        private localStorageService: LocalStorageService,
        private apiService: CampaignService,
        private scoreService: ScoreService,
        private renderer2: Renderer2, private elementRef: ElementRef
    ) {}

    ngOnInit(): void {
        this.quizzes = this.localStorageService.getItem('quizzes');
        this.lessonId = this.localStorageService.getItem('lessonId');
        this.campaignId = this.localStorageService.getItem('campaignId');
        this.lessonLanguageId = this.localStorageService.getItem('lessonLanguageId');        
        this.scedualUserId = this.localStorageService.getItem('scedualUserId');
        if (!this.quizzes) {
           // so go to data base and get quizzes
           this.fetchQuizess();
        }

        if (this.lessonId) {
            this.apiService.updateScedualUserUpdateQuizViewingTime(this.scedualUserId).subscribe({
                next: () => {},
                error: (e) => {
                    console.log(e);
                },
            });
        }
        this.loadSelectedAnswer();
    }

    fetchQuizess(){
        if (this.lessonLanguageId) {
            this.apiService.getQuizzesWithAnswersByLessonLanguageId(this.lessonLanguageId).subscribe({
                next: (res) => {
                    this.quizzes = res
                    this.localStorageService.setItem('quizzes', this.quizzes);
                },
                error: (err) => {
                    console.log(err);
                },
            })
        }
    }

    loadSelectedAnswer(): void {
        const savedAnswers = this.localStorageService.getItem('selectedAnswers') || {};
        this.selectedQuizAnswerIndex = savedAnswers[this.currentQuestionIndex] ?? -1;
    }

    saveSelectedAnswer(): void {
        const savedAnswers = this.localStorageService.getItem('selectedAnswers') || {};
        savedAnswers[this.currentQuestionIndex] = this.selectedQuizAnswerIndex;
        this.localStorageService.setItem('selectedAnswers', savedAnswers);
    }

    prevQuestion(): void {
        if (this.currentQuestionIndex > 0) {
            this.saveSelectedAnswer();
            this.currentQuestionIndex--;
            this.loadSelectedAnswer();
        }
    }

    nextQuestion(): void {
        if (this.selectedQuizAnswerIndex !== -1) {
            this.saveSelectedAnswer();
            if (this.currentQuestionIndex < this.quizzes.length - 1) {
                this.currentQuestionIndex++;
                this.loadSelectedAnswer();
            }
        }
    }

    submitQuiz(): void {
        if (this.selectedQuizAnswerIndex !== -1) {
            this.saveSelectedAnswer();
            if (this.currentQuestionIndex < this.quizzes.length - 1) {
                this.currentQuestionIndex++;
                this.loadSelectedAnswer();
            }
        }

        const savedAnswers = this.localStorageService.getItem('selectedAnswers');
        const totalQuestions = this.quizzes.length;
        let correctAnswers = 0;
        const trainingLessonQuizAnswerIds: string[] = [];

        this.quizzes.forEach((quiz, index) => {
            const selectedAnswerIndex = savedAnswers[index];
            if (quiz.trainingLessonQuizAnswers[selectedAnswerIndex].isTrueAnswer) {
                correctAnswers++;
            }
            trainingLessonQuizAnswerIds.push(quiz.trainingLessonQuizAnswers[selectedAnswerIndex].id);
        });

        const score = (correctAnswers / totalQuestions) * 100;

        this.scoreService.setScore(score);
        this.scoreService.setNumberOfCorrectAnswers(correctAnswers);
        const userQuizAnswerDto: UserQuizAnswerDto = {
            scedualUserId : this.scedualUserId,
            trainingLessonId: this.lessonId,
            trainingLessonQuizAnswerIds: trainingLessonQuizAnswerIds,
            score : score,
            isUserPassed: score >= 50 ? true : false,
        };

        if(userQuizAnswerDto.isUserPassed){
            this.celebrate();
        }
        this.apiService.saveUserQuizAnswers(userQuizAnswerDto).subscribe({
            next: (response) => {
                this.router.navigate([`training-campaign/${this.scedualUserId}/${this.campaignId}/score`]);
            },
            error: (e) => {
                console.log(e);
            },
        });
    }

    prevPage(): void {
        this.router.navigate([`training-campaign/${this.scedualUserId}/${this.campaignId}/video`]);
    }

    celebrate(): void {
        const canvas = this.renderer2.createElement('canvas');
        this.renderer2.appendChild(document.body, canvas);
    
        this.renderer2.setStyle(canvas, 'position', 'fixed');
        this.renderer2.setStyle(canvas, 'top', '0');
        this.renderer2.setStyle(canvas, 'left', '0');
        this.renderer2.setStyle(canvas, 'width', '100vw');
        this.renderer2.setStyle(canvas, 'height', '100vh');
        this.renderer2.setStyle(canvas, 'pointer-events', 'none');
        this.renderer2.setStyle(canvas, 'z-index', '11102');
    
        const myConfetti = confetti.create(canvas, {
          resize: true
        });
    
        myConfetti({
          particleCount: 1000,
          spread: 2000,
          startVelocity: 65,
          gravity: 0.7,
          ticks: 2000,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#bb0000', '#ffffff', '#00bbff', '#00ff00', '#800080', '#FFA500']
        });
      }
}
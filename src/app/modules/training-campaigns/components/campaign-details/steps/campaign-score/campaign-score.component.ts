import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ScoreService } from './score.service';
import { ITrainingLessonQuiz } from 'src/app/modules/security-training/models/ISecurityTrainingModel';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { Subscription } from 'rxjs';
import { CampaignService } from 'src/app/modules/training-campaigns/services/campaign.service';
import { FileDownloadService } from 'src/app/core/Services/file-download.service';

interface NavigationState {
    score: number;
}

@Component({
    selector: 'app-campaign-score',
    templateUrl: './campaign-score.component.html',
    styleUrl: './campaign-score.component.scss',
})
export class CampaignScoreComponent implements OnInit {
    celebratingDialog: boolean = false;
    certificateDialog: boolean = false;
    score: number;
    correctanswers: number;
    quizzes: ITrainingLessonQuiz[] = [];
    selectedAnswers: { [key: string]: number } = {};
    isBookViewed = true;
    isVideoCompleted: boolean = false;
    subs: Subscription = new Subscription();
    generatedCertificate: string;
    pointingValues:{videoPointValue: number, bookPointValue : number} = {
        bookPointValue:0,
        videoPointValue:0
    }

    constructor(
        private router: Router,
        private scoreService: ScoreService,
        private localStorageService: LocalStorageService,
        private apiService: CampaignService,
        private ref: ChangeDetectorRef,
        private location: Location,
        private downloadService: FileDownloadService
    ) {}

    ngOnInit(): void {
        this.score = this.scoreService.getScore();
        if (this.score === 0) {
            this.location.back();
        }
        this.celebratingDialog = this.score >= 50 ? true : false;
        this.correctanswers = this.scoreService.getNumberOfCorrectAnswers();
        this.quizzes = this.localStorageService.getItem('quizzes');
        this.isBookViewed = this.localStorageService.getItem('isBookViewed');
        this.isVideoCompleted = this.localStorageService.getItem('isVideoCompleted');
        const savedAnswers = this.localStorageService.getItem('selectedAnswers');
        if (savedAnswers) {
            this.selectedAnswers = savedAnswers;
        }
        this.fetchPointingValues();
    }

    fetchPointingValues(){
        this.apiService.getPointingValues().subscribe({
            next: (rquest) => {
                this.pointingValues = rquest.data;
            },
            error: (e) => {
                console.log(e);
            }
        });
    }

    isPassed(): boolean {
        return this.score >= 50;
    }

    backToLessonsPage(): void {
        this.router.navigate([`training-campaign`]);
    }

    isSelectedCorrect(questionIndex: number, answerIndex: number): boolean {
        const selectedAnswer = this.selectedAnswers[questionIndex.toString()];
        return selectedAnswer === answerIndex;
    }

    isTrueAnswer(questionIndex: number, answerIndex: number): boolean {
        const quiz = this.quizzes[questionIndex];
        return quiz.trainingLessonQuizAnswers[answerIndex].isTrueAnswer;
    }

    onDoneClick(): void {
        var userData = this.localStorageService.getCurrentUserData();
        const campaignId = this.localStorageService.getItem('campaignId');
        const userId = userData.userId;

        this.subs.add(
            this.apiService.checkUserEligibilityForCertificateAsync(userId, campaignId).subscribe((data) => {
                this.generatedCertificate = data.data;
                this.celebratingDialog = false;
                if (this.generatedCertificate !== null) {
                    this.certificateDialog = true;
                }
                this.ref.detectChanges();
            })
        );
    }

    closeCertificateDialog() {
        this.certificateDialog = false;
    }

    shareOnFacebook() {
        const url = this.generatedCertificate; // The URL of the certificate image
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookShareUrl, '_blank');
    }

    shareOnTwitter() {
        const url = this.generatedCertificate;
        const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
        )}&text=Check out my certificate!`;
        window.open(twitterShareUrl, '_blank');
    }

    shareOnLinkedIn() {
        const url = this.generatedCertificate;
        const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedInShareUrl, '_blank');
    }

    shareOnSnapchat() {
        const url = this.generatedCertificate; // Ensure this is the full, publicly accessible URL
        const snapchatShareUrl = `https://snapchat.com/share?text=Check out my certificate! ${encodeURIComponent(url)}`;
        window.open(snapchatShareUrl, '_blank');
    }

    shareViaGmail() {
        const url = this.generatedCertificate;
        const subject = 'Check out my certificate!';
        const body = `I wanted to share my certificate with you: ${url}`;
        const gmailShareUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailShareUrl, '_blank');
    }
    
    shareOnWhatsApp() {
        const certificateUrl = this.generatedCertificate;
        const message = `Check out my certificate: ${certificateUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    downloadCertificate(){
        if (this.generatedCertificate) {
            this.downloadService.downloadFile(this.generatedCertificate).subscribe();
        }
    }
}
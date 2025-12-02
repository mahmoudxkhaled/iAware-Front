import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { IGame } from '../models/gamification-models';
import { ILanguageModel } from '../../language/models/ILanguageModel';

@Injectable({
    providedIn: 'root',
})
export class GamificationService {
    constructor(private dataService: DataService) {}

    //#region  Game

    // Fetch all games
    getAllGames(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Game/GetAllGames');
    }

    // Fetch a game by ID
    getGameById(id: string): Observable<IGame> {
        return this.dataService.getByReguest<ApiResult>('/Game/GetGameById', id).pipe(
            map((result) => {
                return result.data as IGame;
            })
        );
    }

    // Add a new game
    addGame(request: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/Game/AddGame`, request);
    }

    // Edit an existing game
    editGame(data: FormData): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>('/Game/EditGame', data).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }

    // Activate a game
    activateGame(id: string): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>(`/Game/ActivateGame/${id}`, null).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }

    // Deactivate a game
    deactivateGame(id: string): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>(`/Game/DeactivateGame/${id}`, null).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }

    // Delete a game
    deleteGame(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/Game/DeleteGame/${id}`, null);
    }

    // Fetch default game settings or a default game (example method, adjust as per actual use case)
    getDefaultGame(): Observable<IGame> {
        return this.dataService.getAllReguest<ApiResult>('/Game/GetDefaultGame').pipe(
            map((res) => {
                return res.data as IGame;
            })
        );
    }
    //#endregion

    //#region Game Languages

    getGameLanguageById(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/GameLanguage/GetGameLanguageById', id);
    }

    // Add a new game
    addNewGameLanguage(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/GameLanguage/AddGameLanguage`, request);
    }

    // Edit an existing game
    editGameLanguage(data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/GameLanguage/EditGameLanguage', data);
    }

    // Activate a game
    activeGameLanguageById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/GameLanguage/ActiveGameLanguageById/${id}`, null);
    }

    // Deactivate a game
    deActiveGameLanguageById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/GameLanguage/DeActiveGameLanguageById/${id}`, null);
    }

    // Delete a game
    deleteGameLanguageById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/GameLanguage/DeleteGameLanguageById/${id}`, null);
    }

    //#endregion

    //#region Game Questions

    getAllQuestionsWithAnswersByGameId(id: number): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(
            '/GameLanguage/GetAllGameLanguagesWithQuestionsWithAnswersByGameId',
            id
        );
    }

    getGameLanguageQuestionsByGameLanguageIdAsync(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(
            '/GameLanguageQuestion/GetGameLanguageQuestionsByGameLanguageId',
            id
        );
    }

    addGameLanguageQuestion(request: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/GameLanguageQuestion/AddGameLanguageQuestion', request);
    }

    editGameQuestionWithAnswers(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/GameLanguageQuestion/EditGameQuestionWithAnswers', request);
    }

    deleteGameQuestionWithAnswersById(quizId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/GameLanguageQuestion/DeleteGameQuestionWithAnswersById/${quizId}`,
            null
        );
    }

    activeGameQuestionById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/GameLanguageQuestion/ActiveGameQuestionById/${id}`, null);
    }

    deActiveGameQuestionById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/GameLanguageQuestion/DeActiveGameQuestionById/${id}`, null);
    }

    //#endregion
}

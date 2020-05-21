import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';

import { from, Observable } from 'rxjs';

import { Quiz } from './quiz.model';

@Injectable()
export class QuizService {

    constructor(
        private angularFirestore: AngularFirestore,
        private fireFunctions: AngularFireFunctions,
    ) { }

    public endRound(quizId: string, roundId: string): Observable<void> {
        const endRound = this.fireFunctions.httpsCallable<any, void>('QuizRoundEnd');
        return endRound({ quizId, roundId });
    }

    public nextQuestion(quizId: string, currentRound: string, currentQuestion: string = null): Observable<void> {
        const quizRef = this.angularFirestore
            .collection<Quiz>('quizzes')
            .doc<Quiz>(quizId);

        return from(quizRef.update({ currentRound, currentQuestion }));
    }

    public findOne(quizId: string): Observable<Quiz> {
        const quizRef = this.angularFirestore
            .collection<Quiz>('quizzes')
            .doc<Quiz>(quizId);

        return quizRef.valueChanges();
    }

}

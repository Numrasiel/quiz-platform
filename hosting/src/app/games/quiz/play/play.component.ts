import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { of, Subject } from 'rxjs';
import { filter, map, mergeMap, takeUntil, tap } from 'rxjs/operators';

import { Game } from '@core/models';

import { Question, Quiz, Round } from '../quiz.model';

import { QuizService } from '../quiz.service';
import { RoundService } from '../round.service';
import { QuestionService } from '../question.service';

@Component({
    templateUrl: './play.component.html',
    styleUrls: [ './play.component.scss' ],
    providers: [
        QuizService,
        RoundService,
        QuestionService,
    ],
})
export class PlayComponent implements OnInit, OnDestroy {

    public game: Game;
    public quiz: Quiz;
    public rounds: Array<Round>;
    public question: Question;

    private isDestroyed = new Subject();

    constructor(
        private route: ActivatedRoute,
        private quizService: QuizService,
        private roundService: RoundService,
        private questionService: QuestionService,
    ) { }

    public ngOnInit(): void {
        this.game = this.route.snapshot.data.gameData;

        this.roundService.findAll(this.game.uid)
            .subscribe((rounds) => this.rounds = rounds);

        this.quizService
            .findOne(this.route.snapshot.params.gameId)
            .pipe(
                takeUntil(this.isDestroyed),
                tap((quiz) => this.quiz = quiz),
                filter((quiz) => !!quiz.currentRound),
                mergeMap((quiz) => {
                    if (this.quiz.currentQuestion) {
                        return this.questionService
                            .findOne(this.game.uid, this.quiz.currentRound, quiz.currentQuestion)
                            .pipe(
                                tap((question) => this.question = question),
                                map(() => quiz),
                            );
                    }
                    return of(quiz);
                }),
            )
            .subscribe((quiz) => this.quiz = quiz);
    }

    public ngOnDestroy(): void {
        this.isDestroyed.next();
        this.isDestroyed.complete();
    }

    get round(): Round {
        if (!this.quiz || !this.quiz.currentRound) {
            return undefined;
        }
        return this.rounds.find((round) => round.uid === this.quiz.currentRound);
    }

}

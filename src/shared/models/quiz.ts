import { Question } from "./question";

export interface Quiz {
    $key?: string;
    evenUser: {
        key: string;
        points: number;
    },
    oddUser: {
        key: string;
        points: number;
    },
    questions: Array<Question>
}
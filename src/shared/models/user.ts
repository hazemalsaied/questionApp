export interface User {
    $key?: string;
    email: string;
    password?: string;
    jokerNum: number;
    hammarNum: number;
    stormNum?: number;
    pointNum: number;
    goldenPoints?:number;
    name: string;
    role: string;
    imageUrl?: string;
    imageLink?:string;
    sex?: string;
    language?: string;
    country?: string;
    questionNumber?: number;
    unlimitedSavedQuestionNum?: boolean;
    questions?: [QuestionKey];
    teams?: [any],
    noAds?: false;
    quiz?: string;
    speedTestScore?:number;
    infiniteScore?:number;
    invitations?: [TeamKey];
}
export interface QuestionKey {
    key: string;
}

export interface TeamKey {
    key: string;
}
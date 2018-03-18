export interface User {
    $key?: string;
    email: string;
    password?: string;
    jokerNum: number;
    hammerNum: number;
    pointNum: number;
    name: string;
    role: string;
    imageUrl?: string;
    sex?: string;
    language?: string;
    country?: string;
    questionNumber?: number;
    unlimitedSavedQuestionNum?:boolean;
    questions?: [QuestionKey];
    teams?:[TeamKey],
    noAds?: false;
}
export interface QuestionKey {
    key: string;
}

export interface TeamKey {
    key: string;
}
export interface Question {
    $key?: string;
    questionType: string;
    content: string;
    answer: string;
    answerType: string;
    choices: Array<Choice>;
    imageUrl: string;
    imageLink?:string;
    language?: string;
    difficulty: string;
    time?: string;
    showMe?: boolean;
    user: string;
    userName?: string;
    cat: string;
    subCat: string;
    DiffIdx?: string;
    DiffCatIdx?: string;
    DiffSubCatIdx?: string;
    userChoice?: string;
    reported?: boolean;


    evenUserHammer?: boolean;
    evenUserJoker?: boolean;
    evenUserStorm?: boolean;

    oddUserHammer?: boolean;
    oddUserJoker?: boolean;
    oddUserStorm?: boolean;


    evenUserAnswer?: string;
    oddUserAnswer?: string;

}

export interface Category {
    $key?: string,
    displayName: string,
    displayNameArabic: string,
    alias: string,
    hasParent: boolean,
    parentKey: string,
    showMe: boolean,
    showSubCats: boolean,
    questionNumber: number,
    subCats?:Array<any>
}

export interface CategoryAlias {
    key: string
}


export interface Choice {
    text: string
}

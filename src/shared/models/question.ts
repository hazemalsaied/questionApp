export interface Question {
    $key?: string;
    questionType: string;
    content: string;
    answer: string;
    answerType: string;
    choices: Array<Choice>;
    imageUrl: string;
    language: string;
    difficulty: string;
    time: string;
    showMe: boolean;
    user: string;
    userName: string;
    cat: string;
    subCat: string;
    cats: [{key:string}];
    DiffIdx:  string;
    DiffCatIdx:  string;
    DiffSubCatIdx:  string;
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
    questionNumber:number
}

export interface CategoryAlias {
    key: string
}


export interface Choice {
    text: string
}

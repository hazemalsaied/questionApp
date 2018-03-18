export interface Team {
    $key?: string;
    name: string;
    imageUrl: string;
    slogan: string; 
    users: [TeamUserAlias];
    points: number;
    admin: string;
    showMe?:boolean;
}

export interface TeamUserAlias {
    key: string;
    isAdmin: boolean;
}
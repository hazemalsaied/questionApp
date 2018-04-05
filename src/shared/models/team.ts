import { User } from 'firebase';
export interface Team {
    $key?: string;
    name: string;
    imageUrl?: string;
    slogan?: string; 
    users?: [any];
    points?: number;
    admin: string;
    showMe?:boolean;
    realUsers?:[any];
    imageLink?:string;
}

export interface TeamUserAlias {
    key: string;
    isAdmin: boolean;
}
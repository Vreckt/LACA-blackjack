export class User {
    id: string;
    name: string;
    icon: number;
    credits: number;


    constructor(id: string, name: string, icon: number, credits: number) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.credits = credits;
    }

    changeName() { }
    changeIcon() { }
}
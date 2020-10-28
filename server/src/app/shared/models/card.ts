export class Card {
    name: string;
    shortName: string;
    visible: boolean;
    value: number;

    constructor(name: string, shortName: string, visible: boolean, value: number) {
        this.name = name;
        this.shortName = shortName;
        this.visible = visible;
        this.value = value;
    }
}
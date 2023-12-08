import { v4 as uuid } from "uuid";
export class Game {
    constructor() {
        this.id = uuid();
        this.white = null;
        this.black = null;
    }
}

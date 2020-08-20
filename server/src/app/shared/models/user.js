class User {
    constructor(id, name, icon, credits) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.credits = credits;
    }

    changeName() { }
    changeIcon() { }
} 

module.exports = User;
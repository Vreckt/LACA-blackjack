
class User {
  id;
  name;
  avatar;
  money;
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.avatar = null,
    this.money = null
  }

}

module.exports = User;
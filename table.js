

class Table {
    constructor(id, name, configs) {
      this.id = id;
      this.name = name;
      this.users = []
      this.configs = configs,
      this.status = 'P'
    }

    getUser() {
        return this.users.slice();
    }
    
    startedTable() {
        this.status = 'S';
    }

    FinishedTable() {
        this.status = 'F';
    }
  
}

  module.exports = Table;
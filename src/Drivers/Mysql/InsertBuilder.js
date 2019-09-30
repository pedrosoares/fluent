class InsertBuilder {

    constructor(table, columns, values){
        this.table = table;
        this.columns = columns;
        this.values = values;
    }

    tablerize(column){
        return `\`${column}\``;
    }

    parse(){
        return `INSERT INTO ${this.tablerize(this.table)} (${this.columns.map(c => this.tablerize(c)).join(',')}) VALUES ?;`;
    }

}

export default InsertBuilder;

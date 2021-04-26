class InsertBuilder {

    constructor(table, columns, values) {
        this.table = table;
        this.columns = columns;
        this.values = values;
    }

    tablerize(column) {
        return `\`${column}\``;
    }

    parse() {
        const fields = this.columns.map(c => this.tablerize(c)).join(', ');
        const values = this.values.length > 1 ? "?" : "(?)";
        return `INSERT INTO ${this.tablerize(this.table)} (${fields}) VALUES ${values};`;
    }

}

export default InsertBuilder;

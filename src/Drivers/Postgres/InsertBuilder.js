class InsertBuilder {

    constructor(table, columns, values) {
        this.table = table;
        this.columns = columns;
        this.values = values;
    }

    tablerize(column) {
        return `"${column}"`;
    }

    parse() {
        let index = 0;
        const fields = this.columns.map(c => this.tablerize(c)).join(',');
        const values = this.values.map(() => `(${
            this.columns.map(() => `$${++index}`).join(", ")
        })`).join(', ');
        return `INSERT INTO ${this.tablerize(this.table)} (${fields}) VALUES ${values} RETURNING *;`;
    }

}

export default InsertBuilder;

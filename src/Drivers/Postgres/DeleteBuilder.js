import FilterBuilder from "./FilterBuilder";

class DeleteBuilder {

    constructor(table, filters) {
        this.table = table;

        this.filters = filters;
    }

    tablerize(column) {
        return `"${column}"`;
    }

    parse() {
        const whereBuilder = new FilterBuilder(this.filters);

        const whereBuilt = whereBuilder.parse();

        return {
            sql: `DELETE FROM ${this.tablerize(this.table)} ${whereBuilt.sql}`.trim(),
            data: whereBuilt.data
        }
    }

}

export default DeleteBuilder;

import FilterBuilder from "./FilterBuilder";

class UpdateBuilder {

    constructor(table, columns, filters, limit, order){
        this.table = table;
        this.columns = columns;

        this.filters = filters;

        this.limit = limit || {};
        this.order = order || {};
    }

    tablerize(column) {
        return `"${column}"`;
    }

    parse() {
        const whereBuilder = new FilterBuilder(this.filters);

        const columns = Object.keys(this.columns);
        const values = Object.values(this.columns);

        const data = columns.map((col, index) => `${col} = $${index+1}`).join(', ');
        const whereBuilt = whereBuilder.parse(columns.length);

        this.parseLimit(); // Validate if there is no Limit at Update

        return {
            sql: `UPDATE ${this.tablerize(this.table)} SET ${data} ${whereBuilt.sql} ${this.parseOrder()}`.trim(),
            data: values.concat(whereBuilt.data)
        }
    }

    parseLimit() {
        if(!!this.limit.skip){
            throw new Error("Postgres does not support Skip at Update Query");
        }
        if(!!this.limit.take){
            throw new Error("Postgres does not support Take at Update Query");
        }
    }

    parseOrder() {
        if(!!this.order.column && !!this.order.direction) {
            throw new Error("Postgres does not support Order By at Update Query");
        }
        return "";
    }

}

export default UpdateBuilder;

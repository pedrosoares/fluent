import FilterBuilder from "./FilterBuilder";

class UpdateBuilder {

    constructor(table, columns, filters, limit, order){
        this.table = table;
        this.columns = columns;

        this.filters = filters;

        this.limit = limit || {};
        this.order = order || {};
    }

    tablerize(column){
        return `\`${column}\``;
    }

    parse(){
        const whereBuilder = new FilterBuilder(this.filters);

        const columns = Object.keys(this.columns);
        const values = Object.values(this.columns);

        const data = columns.map((col, index) =>
            `${col} = ?${index >= (columns.length-1) ? '' : ', '}`
        ).join('');

        const whereBuilded = whereBuilder.parse();

        return {
            sql: `UPDATE ${this.tablerize(this.table)} SET ${data} ${whereBuilded.sql} ${this.parseOrder()} ${this.parseLimit()}`.trim(),
            data: values.concat(whereBuilded.data)
        }
    }

    parseLimit(){
        let skip = "";
        let take = "";
        if(!!this.limit.skip){
            skip = `OFFSET ${this.limit.skip}`;
        }
        if(!!this.limit.take){
            take = `LIMIT ${this.limit.take}`;
        }
        return `${take} ${skip}`.trim();
    }

    parseOrder(){
        if(!!this.order.column && !!this.order.direction) {
            return `ORDER BY ${this.tablerize(this.order.column)} ${this.order.direction}`;
        }
        return "";
    }

}

export default UpdateBuilder;
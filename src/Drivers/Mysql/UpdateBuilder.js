import FilterBuilder from "./FilterBuilder";

class UpdateBuilder {

    constructor(table, columns, filters){
        this.table = table;
        this.columns = columns;

        this.filters = filters;
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
            sql: `UPDATE ${this.tablerize(this.table)} SET ${data} ${whereBuilded.sql}`.trim(),
            data: values.concat(whereBuilded.data)
        }
    }

}

export default UpdateBuilder;
import FilterBuilder from "./FilterBuilder";

class DeleteBuilder {

    constructor(table, filters){
        this.table = table;

        this.filters = filters;
    }

    tablerize(column){
        return `\`${column}\``;
    }

    parse(){
        const whereBuilder = new FilterBuilder(this.filters);

        const whereBuilded = whereBuilder.parse();

        return {
            sql: `DELETE FROM ${this.tablerize(this.table)} ${whereBuilded.sql}`.trim(),
            data: whereBuilded.data
        }
    }

}

export default DeleteBuilder;
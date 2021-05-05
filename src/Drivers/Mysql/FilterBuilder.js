class FilterBuilder {

    constructor(filters) {
        this.filters = filters;
    }

    typerize(type) {
        if(!type) return '';
        switch (type){
            case 'and':
                return ' AND';
            case 'or':
                return ' OR';
            default:
                throw new Error("Invalid filter type");
        }
    }

    columnrize(column) {
        return `\`${column}\``;
    }

    comparize(compare) {
        //TODO validate all comparation types
        return compare;
    }

    parse() {
        if(this.filters.length === 0) return "";
        const values = [];
        const parseFunction = (filter) => {

            if(filter instanceof Object && !!filter.filter){
                const type = this.typerize(filter.type);
                return [ `${type} (`, ...filter.filter.map(parseFunction), ') ' ].join('');
            } else if(filter instanceof Object && !!filter.raw) {
                const type = this.typerize(filter.type);
                return `${type} ${filter.raw}`;
            } else if(filter instanceof Object){
                const type = this.typerize(filter.type);
                const column = this.columnrize(filter.column);
                const compare = this.comparize(filter.compare);
                values.push(filter.value);
                return `${type} ${column} ${compare} ?`;
            } else {
                throw new Error("Invalid filter object type");
            }
        };

        const result = this.filters.map(parseFunction).join(' ');
        return {
            sql: `WHERE${result}`,
            data: values
        };
    }

}

export default FilterBuilder;

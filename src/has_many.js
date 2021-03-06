class HasMany {

    constructor(queryBuilder, table, foreignKey, localId){
        this.queryBuilder = queryBuilder;
        this.table = table;
        this.foreignKey = foreignKey;
        this.localId = localId;
    }

    parse(data=[]){
        //Find the Key of Search
        return data.map(d => {
            if(d.hasOwnProperty(this.localId)) return d[this.localId];
            return null;
        })
        //Remove NULL Values
        .filter(d => !!d);
    }

    get(group, data=[]){
        const parentIds = this.parse(data);
        if(parentIds.length === 0) return null;
        const firstId = parentIds.pop();
        this.queryBuilder.where(this.foreignKey, firstId);
        parentIds.forEach(id => this.queryBuilder.orWhere(this.foreignKey, id));
        return this.queryBuilder.get().then(response => {
            return ({
                group,
                foreignKey: this.foreignKey,
                localId: this.localId,
                data: response
            });
        });
    }

}

export { HasMany };

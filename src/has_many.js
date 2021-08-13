import { dataToModel } from "./helpers";

class HasMany {

    constructor(queryBuilder, model, foreignKey, localId){
        this.queryBuilder = queryBuilder;
        this.model = model;
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
                type: "many",
                group,
                foreignKey: this.foreignKey,
                localId: this.localId,
                data: response.map(data => dataToModel(this.model, data))
            });
        });
    }

}

export { HasMany };

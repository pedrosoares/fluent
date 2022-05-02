import { dataToModel } from "./helpers";

class HasMany {
    private queryBuilder: any;
    private model: any;
    private foreignKey: any;
    private localId: any;

    constructor(queryBuilder: any, model: any, foreignKey: any, localId: any){
        this.queryBuilder = queryBuilder;
        this.model = model;
        this.foreignKey = foreignKey;
        this.localId = localId;
    }

    parse(data=[]){
        //Find the Key of Search
        return data.map(d => {
            // @ts-ignore
            if(d.hasOwnProperty(this.localId)) return d[this.localId];
            return null;
        })
        //Remove NULL Values
        .filter(d => !!d);
    }

    async get(group: any, data=[]) {
        const parentIds = this.parse(data);
        if(parentIds.length === 0) return ({
            type: "many",
            group,
            foreignKey: this.foreignKey,
            localId: this.localId,
            data: []
        });
        const firstId = parentIds.pop();
        this.queryBuilder.where(this.foreignKey, firstId);
        parentIds.forEach(id => this.queryBuilder.orWhere(this.foreignKey, id));
        return this.queryBuilder.get().then((response: any) => {
            return ({
                type: "many",
                group,
                foreignKey: this.foreignKey,
                localId: this.localId,
                data: response.map((data: any) => dataToModel(this.model, data))
            });
        });
    }

}

export { HasMany };

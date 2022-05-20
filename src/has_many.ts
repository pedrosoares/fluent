import { dataToModel } from "./helpers";
import { QueryBuilder } from "./query.builder";

class HasMany {
    private queryBuilder: QueryBuilder;
    private readonly model: any;
    private readonly foreignKey: string;
    private readonly localId: string;

    constructor(queryBuilder: QueryBuilder, model: any, foreignKey: string, localId: string){
        this.queryBuilder = queryBuilder;
        this.model = model;
        this.foreignKey = foreignKey;
        this.localId = localId;
    }

    parse(data=[]): string[] {
        //Find the Key of Search
        return data.map(d => {
            // @ts-ignore
            if(d.hasOwnProperty(this.localId)) return d[this.localId];
            return null;
        })
        //Remove NULL Values
        .filter(d => !!d) as unknown as string[];
    }

    async get(group: any, data=[], filter: any = null) {
        const parentIds = this.parse(data);
        if(parentIds.length === 0) return ({
            type: "many",
            group,
            foreignKey: this.foreignKey,
            localId: this.localId,
            data: []
        });
        if (filter) {
            this.queryBuilder.where(filter.filter);
        }
        const firstId = parentIds.pop();
        this.queryBuilder.where((qb) => {
            qb.where(this.foreignKey, firstId);
            parentIds.forEach((id: string) => qb.orWhere(this.foreignKey, id));
        })
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

import { HasMany } from "./has_many";

class HasOne extends HasMany {

    async get(group: any, data=[], filter: any = null) {
        return super.get(group, data, filter).then(res => {
            res.type = "one";
            return res;
        })
    }

}

export { HasOne };

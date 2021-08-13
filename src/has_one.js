import { HasMany } from "./has_many";

class HasOne extends HasMany {

    get(group, data=[]){
        return super.get(group, data).then(res => {
            res.type = "one";
            return res;
        })
    }

}

export { HasOne };

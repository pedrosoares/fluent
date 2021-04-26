//import "./test.mysql";
import "./test.postgres";
import Model from '../src/Model';

class Test extends Model {

    constructor() {
        super();
        this.table = 'teste';
    }

}

Test.transaction(async (transaction, commit, rollback) => {
    await Test.create({name: "Mario do caminhão"}, {transaction}).then(test => {
        console.log("Created ", test);
    });

    await Test.insert([{name: "Ana Maria"}, {name: "Paula Latejando"}], {transaction}).then(success => {
        console.log("Creating test at batch, result: ", success);
    });

    await Test.query().where('id', '>', 1).groupBy('name', 'id').orderBy('id', 'asc').take(1).skip(1).get({transaction}).then(response => {
        console.log("response", response);
    });

    await Test.query().where('name', "Mario do caminhão").orWhere('name', "Ana Maria").get({transaction}).then(async tests => {
        console.log("deleting", tests);
        await Promise.all(tests.map(test => {
            return Test.query().where('id', test.id).delete({transaction});
        }));
    });

    await Test.query().where("name", "Paula Latejando").take(1).first({transaction}).then(test => {
        return Test.query().where("id", test.id).update({ name: "Carlão" }, {transaction});
    });


    await Test.query().get({transaction}).then(total => console.log("TOTAL", total));

    commit();
});

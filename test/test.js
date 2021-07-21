import assert from "assert";
import { Model } from "../src/model";
require("./test.postgres");
require("./test.mysql");

class Test extends Model {

    constructor() {
        super();
        // MODEL CONFIGURATIONS
        this.table = 'teste';
        this.protected = [ "id" ];
        // FIELDS
        this.id = null;
        this.name = null;
    }

}

describe(process.env.USE_PG ? 'Postgres' : (process.env.USE_MS ? "Mysql" : ""), async function() {
    before(function(done) {
        Test.query().raw("CREATE TABLE IF NOT EXISTS teste (id serial, name varchar(255));")
            .then(() => done())
            .catch(err => {
                console.log("AQUI", err);
            })
    });

    describe('#create', function() {
        it('should return the object inserted', async function () {
            await Test.create({name: "Mario do caminhão"}).then(test => {
                assert.equal(!!test.id, true);
                assert.equal(test.name, "Mario do caminhão");
            });
        });
    });
    describe('#insert[bulk]', function() {
        it('should return true', async function () {
            await Test.insert([{name: "Ana Maria"}, {name: "Paula Latejando"}])
                .then(success => {
                    assert.equal(success, true);
                });
        });
    });
    describe('#select', function() {
        it('should return 2 items', async function () {
            await Test.insert([{name: "Ana Maria"}, {name: "Paula Latejando"}])
                .then(success => {
                    assert.equal(success, true);
                });
            await Test.query().where("name", "Ana Maria").orWhere("name", "Paula Latejando").take(2).get().then(tests => {
                assert.equal(tests.length, 2);
            });
            await Test.query().where("name", "Ana Maria").orWhere("name", "Paula Latejando").take(2).first().then(tests => {
                assert.equal(!!tests, true);
            });
            await Test.query().where("name", "Ana Maria").orWhere("name", "Paula Latejando").take(2).count().then(tests => {
                assert.equal(tests, 4);
            });
        });
    });
    describe('#update', function() {
        it('should update data', async function () {
            await Test.insert([{name: "Carlao do Pneu"}])
                .then(success => {
                    assert.equal(success, true);
                });
            await Test.query().where("name", "Carlao do Pneu").update({name: "Mario Verde"});
        });
    });
    describe('#delete', function() {
        it('should delete data', async function () {
            await Test.insert([{name: "Mario do Pneu"}])
                .then(success => {
                    assert.equal(success, true);
                });
            await Test.query().where("name", "Mario do Pneu").delete();
        });
    });
    describe('#raw', function() {
        it('select using raw', async function () {
            await Test.query().raw('select 1 as result;')
                .then((rows) => {
                    assert.equal(rows.length, 1);
                    const { result } = rows.pop();
                    assert.equal(result, 1);
                });
        });
    });
    after(function(done) {
        Test.query().raw("DROP TABLE teste;").then(() => done());
    });
});

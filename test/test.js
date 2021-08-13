import assert from "assert";
import { Model } from "../src/model";
require("./test.postgres");
require("./test.mysql");

class Child extends Model {
    constructor() {
        super();
        // MODEL CONFIGURATIONS
        this.table = 'child';
        this.protected = [ "id" ];
        // FIELDS
        this.id = null;
        this.father_id = null;
        this.firstname = null;
    }
}

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

    childs() {
        return this.hasMany(Child, 'father_id', 'id');
    }

    child() {
        return this.hasOne(Child, 'father_id', 'id');
    }

}

describe(process.env.USE_PG ? 'Postgres' : (process.env.USE_MS ? "Mysql" : ""), async function() {
    before(function(done) {
        Promise.all([
            Child.query().raw("CREATE TABLE IF NOT EXISTS child (id serial, father_id int, firstname varchar(255));"),
            Test.query().raw("CREATE TABLE IF NOT EXISTS teste (id serial, name varchar(255));")
        ]).then(() => done()).catch(err => {
            console.error("Error creating table: ", err);
        });
    });

    describe('#create', function() {
        it('should return the object inserted', async function () {
            const test = await Test.create({name: "Mario do caminhão"}).then(test => {
                assert.equal(!!test.id, true);
                assert.equal(test.name, "Mario do caminhão");
                return test;
            });
            await Child.create({ firstname: "Abreu", father_id: test.id }).then(child => {
                assert.equal(!!child.id, true);
                assert.equal(child.father_id, test.id);
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
            await Test.query().with("childs").where("name", "Mario do caminhão").first().then(test => {
                assert.equal(test.relations.childs.length, 1);
            });
            await Test.query().with("child").where("name", "Mario do caminhão").first().then(test => {
                assert.equal(!!test.relations.child, true);
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
        Promise.all([
            Test.query().raw("DROP TABLE teste;"),
            Test.query().raw("DROP TABLE child;")
        ]).then(() => done());
    });
});

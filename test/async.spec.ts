import spring, {convert, inject, Model, resource, service} from '../src'
import {createStore, Store} from 'redux';

describe('model async function test', function () {
    const store = spring(<Store>createStore(() => {}));
    it('test model async func', (done) => {
        const modelName = 'test model async func'
        @service(modelName)
        class UserModel extends Model {
            name = 100;
            * ajax() {
                this.name = yield new Promise((resolve) => {
                    // resolve(19);
                    setTimeout(() => {
                        resolve(19)
                    }, 11)
                });
                return this.name;
            }
        }


        let model = <UserModel> store.getState()[modelName];
        expect(model.name).toBe(100);
        convert(model.ajax()).then((name) => {
            expect(name).toBe(19);
            model = <UserModel> store.getState()[modelName];
            expect(model.name).toBe(19);
            done();
        })
    });

    it('test complex function', (done) => {
        const modelName = 'test complex function'
        @service(modelName)
        class UserModel extends Model {
            num = 1;
            * setNum() {
                this.num = 2;
                this.num = yield this.ajax();
                return this.num;
            }
            * ajax() {
                return yield new Promise((resolve) => {
                    // resolve(19);
                    setTimeout(() => {
                        resolve(19)
                    }, 11)
                })
            }
        }


        let model = <UserModel> store.getState()[modelName];
        expect(model.num).toBe(1);
        convert(model.setNum()).then((num) => {
            expect(num).toBe(19);
            done()

        })
    });

    it('test throw exception', (done) => {
        const modelName = 'test throw exception'
        @service(modelName)
        class UserModel extends Model {
            num = 1;
            * ajax() {
                try {
                    this.num = 2;
                    yield Promise.reject(new Error('hello'));
                    this.num = 3;
                } catch (e) {
                    this.num = 5;
                    return 6;
                }
            }
        }


        let model = <UserModel> store.getState()[modelName];
        expect(model.num).toBe(1);
        convert(model.ajax()).then((num) => {
            model = <UserModel> store.getState()[modelName];
            expect(model.num).toBe(5);
            expect(num).toBe(6);
            done()
        })
    });
})

import spring, {inject, Model, resource, service} from '../src'
import {createStore} from 'redux';

describe('model async function test', function () {
    it('test model async func', () => {
        const store = createStore(() => {});
        spring(store);
        const modelName = 'test model async 1'
        @service(modelName)
        class UserModel extends Model {
            name = 'hello';
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
        expect(model.name).toBe('hello');
        // @ts-ignore
        model.ajax().then((name) => {
            expect(name).toBe(19);
            model = <UserModel> store.getState()[modelName];
            expect(model.name).toBe(19);
        })
    });

    it('test complex function', () => {
        const store = createStore(() => {});
        spring(store);
        const modelName = 'complex function'
        @service(modelName)
        class UserModel extends Model {
            num = 1;
            * setNum() {
                this.num = 2;
                this.ajax();
                this.num = yield this.ajax();
            }
            * ajax() {
                const num = this.num;
                yield new Promise((resolve) => {
                    // resolve(19);
                    setTimeout(() => {
                        resolve(19)
                    }, 11)
                })
                return num;
            }
        }


        let model = <UserModel> store.getState()[modelName];
        expect(model.num).toBe(1);
        // @ts-ignore
        model.setNum().then((num) => {
            expect(num).toBe(2);
        })
    });

    it('test throw exception', () => {
        const store = createStore(() => {});
        spring(store);
        const modelName = 'exception function'
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
        // @ts-ignore
        model.ajax().then((num) => {
            model = <UserModel> store.getState()[modelName];
            expect(model.num).toBe(5);
            expect(num).toBe(6);
        })
    });
})

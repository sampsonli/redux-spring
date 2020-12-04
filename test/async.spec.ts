import spring, {inject, Model, resource, service} from '../src'
import {createStore} from 'redux';

describe('model dependency inject test', function () {
    it('test model di', () => {
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
})

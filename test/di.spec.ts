import spring, {inject, Model, service} from '../src'
import {createStore} from 'redux';

describe('model dependency inject test', function () {
    it('test model di', () => {
        const store = createStore(() => {});
        spring(store);
        const modelName = 'test model di 1'
        const userModelName = 'test model user 2'
        @service(userModelName)
        class UserModel extends Model {
            name = 'hello';
        }
        @service(modelName)
        class TestModel extends Model {
            @inject(UserModel) user;
            getUser() {
                return this.user;
            }
        }

        let model = <TestModel> store.getState()[modelName]
        let userModel = <UserModel> store.getState()[userModelName]

        expect(model.getUser()).toEqual(userModel);
    });
})

import spring, {inject, Model, resource, service} from '../src'
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
            @resource(userModelName) user2;
            getUser2() {
                return this.user2;
            }
        }

        let model = <TestModel> store.getState()[modelName]
        let userModel = <UserModel> store.getState()[userModelName]

        expect(model.getUser()).toEqual(userModel);
        expect(model.getUser2()).toEqual(userModel);
    });
})

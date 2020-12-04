import spring, {Model, service} from '../src'
import {createStore} from 'redux';

describe('init redux-spring and register model class', function () {
    it('init redux-spring', () => {
        const store = createStore(() => {});
        expect(() => {
            service('test model')(class TestModel extends Model {});
        }).toThrow();
        expect(() => {
            spring(store);
            service('test model')(class TestModel extends Model {});
        }).not.toThrow();
        expect(() => {
            spring(store, {});
            service('test model')(class TestModel extends Model {});
        }).not.toThrow();
    });

    it('register model class by @annotation', () => {
        const store = createStore(() => {});
        spring(store);
        @service('init store instance')
        class TestModel extends Model {
        }
        expect(store.getState()).toHaveProperty('init store instance')
    });
    it('register model class by normal function', () => {
        const store = createStore(() => {});
        spring(store)
        class TestModel extends Model {
        }
        service('init store instance')(TestModel);
        expect(store.getState()).toHaveProperty('init store instance');
    });
});

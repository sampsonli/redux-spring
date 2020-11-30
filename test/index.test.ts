import spring, {Model, service, useModel} from '../src'
import {createStore} from 'redux';

const store = createStore(() => {});
spring(store);

@service('test')
class Test extends Model {
    num = 0;
    add(count) {
        this.num = this.num + count;
    }
}

test('test class function', () => {
    let model = store.getState().test;

    expect(model.num).toBe(0);
    model.add(10);
    model = store.getState().test;
    expect(model.num).toBe(10);
    model.add(10);
    model = store.getState().test;
    expect(model.num).toBe(20);
})


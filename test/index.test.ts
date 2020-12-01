import spring, {Model, service, useModel} from '../src'
import {createStore} from 'redux';


test('test class function', () => {
    const store = createStore(() => {});
    spring(store);
    @service('test')
    class Test extends Model {
        num = 0;
        result = 0;
        add(count) {
            this.num = this.num + count;
        }
    }
    // @ts-ignore
    let model = <Test> store.getState().test

    expect(model.num).toBe(0);
    model.add(10);
    // @ts-ignore
    model = <Test> store.getState().test
    expect(model.num).toBe(10);
    model.add(10);
    // @ts-ignore
    model = <Test> store.getState().test
    expect(model.num).toBe(20);
})

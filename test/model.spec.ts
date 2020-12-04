import spring, {Model, service} from '../src'
import {createStore} from 'redux';

describe('model function and props test', function () {
    it('test model class function', () => {
        const store = createStore(() => {});
        spring(store);
        const modelName = 'test model class function'
        @service(modelName)
        class TestModel extends Model {
            num = 0;
            add(num) {
                this.num = this.num + num;
            }
        }
        let model = <TestModel> store.getState()[modelName]

        expect(model.num).toBe(0);
        model.add(10);
        // @ts-ignore
        model = <Test> store.getState()[modelName];
        expect(model.num).toBe(10);
        model.add(11);
        // @ts-ignore
        model = <Test> store.getState()[modelName];
        expect(model.num).toBe(21);
    });

    it('test model created function', () => {
        const store = createStore(() => {});
        spring(store)
        const modelName = 'test model created function'
        @service(modelName)
        class TestModel extends Model {
            num = 0;
            created() {
                this.num = 100;
            }
        }
        let model = <TestModel> store.getState()[modelName];
        expect(model.num).toBe(100);
    });

    it('test model setData function', () => {
        const store = createStore(() => {});
        spring(store);
        const modelName = 'test model setData function'
        @service(modelName)
        class TestModel extends Model {
            num = 0;
            num2 = 2;
        }
        let model = <TestModel> store.getState()[modelName];
        expect(model.num).toBe(0);
        expect(model.num2).toBe(2);
        model.setData({num: 102, num2: 22});
        model = <TestModel> store.getState()[modelName];
        expect(model.num).toBe(102);
        expect(model.num2).toBe(22);

    });

    it('test model reset function', () => {
        const store = createStore(() => {});
        spring(store);
        const modelName = 'test model setData function'
        @service(modelName)
        class TestModel extends Model {
            num = 0;
            num2 = 2;
        }
        let model = <TestModel> store.getState()[modelName];
        expect(model.num).toBe(0);
        expect(model.num2).toBe(2);
        model.setData({num: 102, num2: 22});
        model = <TestModel> store.getState()[modelName];
        expect(model.num).toBe(102);
        expect(model.num2).toBe(22);
        model.reset();
        model = <TestModel> store.getState()[modelName];
        expect(model.num).toBe(0);
        expect(model.num2).toBe(2);

    });
})

import spring, {Model, service} from '../src'
import {createStore, Store} from 'redux';

describe('model function and props test', function () {
    const store = spring(<Store>createStore(() => {}));
    it('test model class function', () => {
        const modelName = 'model function and props test'
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
        model = <TestModel> store.getState()[modelName];
        expect(model.num).toBe(10);
        model.add(11);
        model = <TestModel> store.getState()[modelName];
        expect(model.num).toBe(21);
    });

    it('test model created function', () => {
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
        const modelName = 'test model reset function'
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
    it('test model data update', () => {
        const modelName = 'test model data update'

        @service(modelName)
        class TestModel extends Model {
            num = 0;
            setNum(num) {
                this.num = num;
            }
        }

        let model = <TestModel>store.getState()[modelName];
        expect(model.num).toBe(0);
        model.setNum(1);
        expect(store.getState()[modelName]).not.toEqual(model);
        model = <TestModel>store.getState()[modelName];
        model.setNum(1);
        expect(store.getState()[modelName]).toEqual(model);
        model = <TestModel>store.getState()[modelName];
        model.setData({num: 1});
        expect(store.getState()[modelName]).toEqual(model);
        model = <TestModel>store.getState()[modelName];
        model.setData({num: 2});
        expect(store.getState()[modelName]).not.toEqual(model);
    });

    it('test dev modal model static props', () => {
        const modelName = 'test dev modal model static props'

        @service(modelName)
        class TestModel extends Model {
            static a = 10
        }
        expect(TestModel.a).toBe(10);


        @service(modelName)
        class Test2Model extends Model {
            static a = 20
        }
        expect(TestModel.a).toBe(10);

    });
})

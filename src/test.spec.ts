import {Model, service, useModel} from './index'


class Test extends Model{
    name = 'lichun'
    getName() {
        return this.name
    }

}
const t = service('hello')(Test)
const test = useModel(Test);
console.log(test.getName())

import {Model, model, useModel} from './index'

@model('hello')
class Test extends Model{
    name = 'lichun'
    getName() {
        return this.name
    }

}
const test = useModel(Test);
console.log(test.getName())

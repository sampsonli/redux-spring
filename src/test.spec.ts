import {Controller, Service, useModel} from './index'

@Service('hello')
class Test {
    name = 'lichun'
    getName() {
        return this.name
    }

}
const test = useModel(Test);
console.log(test.getName())

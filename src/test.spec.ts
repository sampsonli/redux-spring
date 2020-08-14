import {Controller, useModel} from './index'

@Controller('hello')
class Test {
    name = 'lichun'
    getName() {
        return this.name
    }

}
const test = useModel(Test);
console.log(test.getName())

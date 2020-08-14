import {Controller, useModel} from './index'

// @ts-ignore
@Controller
class Test {
    name = 'lichun'
    getName() {
        return this.name
    }

}
const test = useModel(Test);
console.log(test.getName())

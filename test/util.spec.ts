import {isGenerator, assign
} from '../src/util'

describe('util function test', function () {
    it('test isGenerator', () => {
       function *test(){
           console.log('hello')
           yield 0;
       }
       function test2(){
       }
       expect(isGenerator(test)).toBeTruthy();
       expect(isGenerator(test2)).toBeFalsy();
    });

    it('test assign', () => {
        const origin = {a: 1};
        const or = {a: 3, b: 2};
        const result = assign(origin, or);
        expect(result).toEqual({a: 3, b: 2});
        expect(result).toBe(origin);
    });
})

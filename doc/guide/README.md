# 开始
> 实现一个简单小需求， 从后端接口获取一个随机数，展示在页面中，
> 页面有一个按钮，点击给获取的随机数+1
### 初始化
- 在项目初始化位置
~~~js
import spring from 'redux-spring';
import store from './store';
spring(store);
~~~
此处目的是给redux-spring注入store,底层很多操作都是通过store这个实例操作的

### 定义model
~~~js
import {service} from 'redux-spring';
function ajax() { // 模拟请求
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(parseInt(Math.random() * 10, 10));
        }, 16);
    });
}


@service('home')
class HomeModel extends Model {
    num = 0;
    * init() {
        this.num = yield ajax();
    }
    add() {
        this.num ++;
    }
}
export default HomeModel;
~~~
1. @service('home') 定义一个模块， 每个模块必须添加此注解， 其中home 是自己给模块取的名称；
2. Model 是个接口， 主要是给model实例和模块类提供接口和属性api， Model定义可以参考[API说明](../api/README.md)；
3. init() 是一个异步方法，在redux-spring中异步方法都是使用 generator方法， 不能用async/await;
4. add() 是定义的普通方法；
5. num 类属性，所有类属性最终都会保存在redux的state中；
6. ***注意*** 不管是普通方法，还是异步方法， 都不能定义为箭头方法， 否则会报错。

### 在页面使用 model

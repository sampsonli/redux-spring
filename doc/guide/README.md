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
1. @service('home') 定义一个模块， 每个模块必须添加此注解， 其中home 是自己给模块取的名称, 如果不想取名，也可直接用module.id；
2. Model 是个接口， 主要是给model实例和模块类提供接口和属性api， Model定义可以参考[API说明](../api/README.md)；
3. init() 是一个异步方法，在redux-spring中异步方法都是使用 generator方法， 不能用async/await;
4. add() 是定义的普通方法；
5. num 类属性，所有类属性最终都会保存在redux的state中；
6. ***注意*** 不管是普通方法，还是异步方法， 都不能定义为箭头方法， 否则会报错。
7. ***注意*** 保留字 setData,reset, ns，不能用于方法名，属性名。 
8. 对部分方法中有异步回调时候， 例如
    ```js
    @service('home')
    class HomeModel extends Model {
        num = 0;
        init() {
            ajax().then(resp => {
                // this.num = resp; // 不能这么写， 否则会导致数据不会同步
                this.setData({num: resp}) // 这样写可以确保对num的修改会同步到根state
                // this.add() 此处调用this的同步方法也不行， 但是可以调用this 的异步方法
    
            });
        }
        add() {
            this.num ++;
        }
    }
    export default HomeModel;
    ```

### 在页面使用 model
- 使用react-hooks 写法
```jsx
import React, {useEffect} from 'react';
import {useModel} from 'redux-spring';
import style from './style.less';
import HomeModel from '../../models/HomeModel';

export default () => {
    const model = useModel(HomeModel);
    const {
        num,
    } = model;
    useEffect(() => {
        model.init();
    }, []);
    return (
        <div className={style.container}>
            <div className={style.content}>
                <div className={style.addOne} onClick={model.add}>
                    +1
                </div>
                <div className={style.txt}>
                    {num}
                </div>
            </div>
        </div>
    );
};

```
- 说明
1. model 中包含模块中定义的数据和方法；
2. 获取model 实例通过 useModel方法 ,传入model所在的类即可；
3. model中所有方法已经绑定过this了， 可以单独拿出来调用；

- 使用类组件
```jsx
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import style from './style.less';

import HomeModel from '../../models/HomeModel';

class Home extends Component {
  render() {
    const {
      model,
    } = this.props;

    const {num, add} = model;
    return (
      <div className={style.container}>
          <div className={style.content}>
              <div className={style.addOne} onClick={add}>
                  +1
              </div>
              <div className={style.txt}>
                  {num}
              </div>
          </div>
       </div>
    );
  }
}

Home.propTypes = {
  model: PropTypes.instanceOf(HomeModel).isRequired,
};

export default connect(state => ({model: state[HomeModel.ns]}))(Home);
```
- 说明
1. 所有model都挂载在根state下, 同时包含组件的类方法和属性；
2. HomeModel.ns 模块定义的名称；
3. 声明组件属性类型的时候建议用 PropTypes.instanceOf(类名);
4. 类组件属性注入需要依赖 react-redux模块，而hooks写法不需要；
5. 声明model的时候建议通过jsdoc指名model类型。

### 高级用法
> 以上案例基本上可以满足绝大部分业务需求, 但是有时候我们定义了多个model， model之间需要有数据共享， 在redux-spring 引入了依赖注入（DI),
> 模块之间可以相互依赖， 我们不需要手动去注入， 框架会根据配置自动注入进来。举个例子，还是在上面的案例中， HomeModel 依赖另外
>一个UserModel, UserModel 中定义了name 属性， HomeModel 初始化后拿到UserModel中的name,并展示在页面中

```js UserModel.js
import {Model, service} from 'redux-spring';

@service('usermodel')
class UserModel extends Model {
  name = 'hello user';
}
export default UserModel;
``` 
- 此处定义了UserModel, 里面有name 属性



```js HomeModel.js
@service('home')
//@service(module.id) // 也可以直接使用模块标识
class HomeModel extends Model {
    num = 0;
    username;
    
    /**
     * @type {UserModel}
     */
    @inject(UserModel) user;
    * init() {
        this.num = yield ajax();
        this.username = this.user.name;
    }
    add() {
        this.num ++;
    }
}
export default HomeModel;

```
- 说明
1. @inject(UserModel)，给属性注入UserModel 实例
2. 注入的实例，类方法中可以获取实例属性， 也可以调用注入实例的方法， 但是不能直接修改实例的属性， 只能通过方法去设置；
3. 被注入的属性前面建议加上jsDoc注释，表明属性类型，方便后续使用实例属性和方法；
4. 页面中尽量不要直接引用被注入的属性，否则可能出现数据不同步的情况。注入的属性主要为了解决模块读取其他模块中数据功能。


最后在页面中展示数据
```jsx
import React, {useEffect} from 'react';
import {useModel} from 'redux-spring';
import style from './style.less';
import HomeModel from '../../models/HomeModel';

export default () => {
    const model = useModel(HomeModel);
    const {
        num,username
    } = model;
    useEffect(() => {
        model.init();
    }, []);
    // model.user.name 可以读取， 但是不建议这样使用，否则可能导致数据不同步。
    return (
        <div className={style.container}>
            <div className={style.content}>
                <div className={style.addOne} onClick={model.add}>
                    +1
                </div>
                <div className={style.txt}>
                    {num}
                </div>
                <div className={style.txt}>
                    {username}
                </div>
            </div>
        </div>
    );
};
```
- 注意： 页面中可以直接使用model注入的user,绝大多数情况下没问题， 如果遇到其他模块修改UserModel中的数据， 会导致当前组件中的数据不能及时同步。


### 参考项目
整合最新react17+webpack5通用模板项目[react_template_project](https://github.com/sampsonli/react_template_project)


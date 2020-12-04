# redux-spring 是什么？
[![Build Status](https://travis-ci.org/sampsonli/redux-spring.svg?branch=master)](https://travis-ci.org/sampsonli/redux-spring)
[![npm version](https://img.shields.io/npm/v/redux-spring.svg?style=flat)](https://www.npmjs.com/package/redux-spring) 
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/sampsonli/redux-spring/blob/master/LICENSE)
----
redux-spring 是一个专为 react + redux 应用程序进行的二次封装库， 解决了基于原生开发redux 遇到的各种问题, 同时提供新的开发理念,
具有以下四大特色:
1. 模块化
2. 面向对象
3. 依赖注入
4. 完美异步解决方案
### 模块化
我们知道 基于原生redux开发， 一个简单dispatch操作中至少需要定义 reducer， action， state， 还有常量，且分别定义在不同文件中， 并且在页面引入的时候
还需要定义mapStateToProps/mapActionToProps 等方法， 总之实现一个dispatch需要编写大量与业务无关的代码， 可读性也不友好， 并且经常要在需要在不同文件来回切换
非常繁琐，导致开发成本直线上升。

基于原生redux开发遇到的种种问题，redux-spring 引入模块概念， 把之前state,reducer,action 整合到一起，定义为一个model， 通过一系列封装，以及引入新的开发理念，
定义一个模块并不会因为整合了所有功能模块而导致代码量急剧上升导致可读性变差。

### 面向对象
面向对象带来的好处不言而喻，网上有大量介绍。
 总的来说， 在数据层面上，更适合基于面向对象开发，展示层面用方法组件而不是类组件， 再配合react hooks新特性，二者可以完美融合。
 我们可以把页面展示和数据流处理剥离开来， 甚至前端开发可以进一步拆分： “静态页面” 与 “数据处理”
一套数据流处理可以同时应用到多场合，比如pc/h5/小程序/react-native。
此外， 完美支持typescript，更方便提供api文档， 不用再为原生redux开发找不到对应action/reducer而烦恼。

### 依赖注入
react-spring 基本理念参考了后端java 中spring框架， DI（依赖注入）核心思想。 所有model都是单实例的，统一由框架创建与维护， 模块之间可以相互依赖，
由react-spring自动注入，用户只需通过注解标注类型即可，这样模块之间数据共享就变得特别简单。


### 异步操作
异步操作在开发过程中特别常见， 基本上所有主流库都有不错的支持， 为什么称***完美***, 肯定有自己的一套特殊的解决方案，
当遇到多个顺序异步操作， 而且异步操作之间有数据修改的情况下可以把修改的数据同步到页面中，而不需要做额外的操作，使得能够和面向对象思想完美融合。
 
# 基本原理介绍
 ![flow](https://raw.githubusercontent.com/sampsonli/redux-spring/master/doc/flow.png)
1. store 下面的state中保存了项目中所有子模块实例， 每个子模块代表所定义模块的一个实例；
2. 每个子模块下有独立的原型对象， 意味着可以直接在模块中调用相应的原型方法；
3. 原型方法对应着定义模块类中的类方法， 初始化的时候会对类方法进行进一步加工处理，劫持里面的this对象指向state下面的子模块实例。


# 开始使用redux-spring
## 安装
```shell script
yarn add redux-spring # npm install --save redux-spring
```
## 从一个简单demo开始
> 实现一个简单小需求， 从后端接口获取一个随机数，展示在页面中，
> 页面有一个按钮，点击给获取的随机数+1
### 1. 初始化
- 在项目初始化位置
~~~js
import spring from 'redux-spring';
import store from './store'; // redux.createStore() 返回来的实例
spring(store);
~~~
1. 此处目的是给redux-spring注入store,底层很多操作都是基于store这个实例进行操作的；
2. ***<font color="red">注意</font>*** 初始化逻辑必须在导入模块之前， 否则导入模块的时候会报错；
3. 如果要和老项目无缝集成可以传入第二个参数。
```js
spring(store, asycReudcers); // asyncReducers 是老项目中的所有reducer（数组类型） 集合
```

### 2. 定义模块类
~~~js
import {service, Model} from 'redux-spring';
function ajax() { // 模拟ajax请求
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(parseInt(Math.random() * 10, 10));
        }, 16);
    });
}


@service('home')
class HomeModel extends Model {
    num = 0;

    * init() { // init 对外暴露的是一个promis方法
        this.num = yield ajax(); // yield 后面可以跟 promise
    }

    add() {
        this.num ++;
    }
    // created() { // 如果定义了created方法，此方法在模块加载的时候会自动执行
    //
    //}
}
export default HomeModel;
~~~
1. @service('home') 定义一个模块， 每个模块必须添加此注解， 其中home 是自己给模块取的名称, 如果不想取名，也可直接用module.id， 比如@service(module.id);
2. redux-spring 大量依赖注解语法， 老版本babel需要配置相应插件；
3. Model 是个接口， 主要是给model实例和类提供接口api和属性， Model定义可以参考[API说明](https://github.com/sampsonli/redux-spring/blob/master/doc/api/README.md)；
4. init() 是一个异步方法，在redux-spring中异步方法都是基于 generator语法， 不推荐用async/await语法， generator和async/await使用方式一模一样；
5. add() 是定义的普通类方法；
6. num 类属性，所有类属性最终都会保存在redux的state中；
7. ***注意*** 不管是普通方法，还是异步方法， 都不能定义为箭头方法， 否则会由于找不到this中的属性而报错；
8. ***注意*** 保留字 setData,reset, ns，created不能用于自定义方法、属性名。 


### 3. 在页面中使用 model
> 页面引入model同时支持类组件和方法组件，使用方法如下：
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
2. 获取model 实例通过 useModel方法 ,传入Model类即可；
3. model中所有方法已经绑定过this了， 可以单独拿出来直接调用；

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
1. 所有model都挂载在store的根state下；
2. HomeModel.ns 模块定义的名称， 等同于@service('home') 中的'home';
3. 声明组件属性类型的时候建议用 PropTypes.instanceOf(类名)；
4. 类组件model注入需要依赖 react-redux模块的Provider，而hooks写法不需要；

## 高级用法
### 1. 依赖注入（DI)
> 以上案例基本上可以满足绝大部分业务需求, 但是有时候我们定义了多个model， model之间需要有数据共享， 在redux-spring 引入了依赖注入（Dependency Inject),
> 模块之间可以相互依赖， 我们不需要手动去注入， 框架会根据配置自动注入进来。举个例子，还是在上面的案例中， HomeModel 依赖另外
> 一个UserModel, UserModel 中定义了name 属性， HomeModel 初始化后拿到UserModel中的name,并展示在页面中;

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
import UserModel from './UserModel';
@service('home')
//@service(module.id) // 也可以直接使用模块标识
class HomeModel extends Model {
    num = 0;
    username;
    
    /**
     * 声明user类型
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
2. 注入的实例，类方法中可以获取实例属性， 也可以调用注入实例的方法， 但是不能直接修改实例的属性， 只能通过setData方法或者类方法去设置；
3. 被注入的属性前面建议加上jsDoc注释，表明属性类型，方便后续使用实例属性和方法；
4. 页面中尽量不要直接引用被注入的属性，否则可能出现数据不同步的情况。注入的属性主要为了解决类方法获取其他模块中数据功能。
5. ***注意*** 在使用被注入的模块的属性前， 一定要确保被注入的模块的属性有值。


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
    // model.user.name 可以读取， 但是不建议这样使用，否则可能导致数据不同步。如果不了解底层原理， 建议不要使用，哈哈
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
### 2. 初始化方法
> 有时候会遇到这种场景， 模块加载的时候进行一些初始化操作， 初始化操作可以定义created方法来实现
```js
@service(module.id)
class CreatedModel extends Model {
    num = 0;
    constructor() { // 构造方法只能初始化变量
        this.num = 1;
        // this.ajaxGet()// 不能调用模块中的方法
    }
    ajaxGet() {
        // 方法逻辑
    }   
    created() { // 如果定义了created方法，此方法在模块加载的时候会自动执行
        thia.ajaxGet() // 此方法中可以调用模块中的方法进行初始化
    }
}
export default CreatedModel;
```
- 最佳实践， 减少created方法使用， 在模块类中定义init方法，然后放入组件的 React.useEffect方法中调用。

### 3. 快捷的操作model中的数据
> 有时候页面中需要修改model中的数据， 如果只是修改少量数据，新定义一个方法会大大增加业务代码量， 可以使用 model.setData(params)方法
> params是一个普通对象， key是要修改的属性名， value是修改后的值。
```jsx
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
                <div className={style.addOne} onClick={() => model.setData({num: num + 1})}>
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
- 用 model.setData({num: num + 1}) 取代 model.add 方法， 可以减少模块定义的代码量， 但是缺点是每次页面渲染都会生成一个新方法， 可能对性能优化不是很友好， 具体取舍看业务场景吧！

### 4. 重置model中的所有数据到初始值
> 组件销毁的时候， 我们要清空现有的数据， 我们可以调用 model.reset；
```jsx
export default () => {
    const model = useModel(HomeModel);
    const {
        num,username
    } = model;
    useEffect(() => {
        model.init();
        return model.reset; // 当前组件销毁的时候会调用 model.reset() 方法
    }, []);
    // model.user.name 可以读取， 但是不建议这样使用，否则可能导致数据不同步。
    return (
        <div className={style.container}>
            <div className={style.content}>
                <div className={style.addOne} onClick={() => model.setData({num: num + 1})}>
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
### 5. 异步方法回调不能直接通过this 修改类属性
> 有两种解决方案， 一种是直接通过setData 方法修改属性， 另外一种是通过初始化promise实例方案， 建议采用后者；
- 直接修改
```js
@service(module.id)
class HomeModel extends Model {
   num = 0;
   getDataByJQuery() {
       $.ajax({
            url: 'xxx',
            method: 'get',
            success: (resp) => {
                // this.num = resp; // 直接修改num属性不生效
                this.setData({num: resp}) // 可以通过直接调用setData方法来更新数据
            }
       })
   }
   add() {
       this.num ++;
   }
}
export default HomeModel;
```

- 封装promise实例
```js
@service(module.id)
class HomeModel extends Model {
   num = 0;
   * getDataByJQuery() {
        this.num = yield new Promise((resolve) => {
            $.ajax({
                url: 'xxx',
                method: 'get',
                success: (resp) => {
                    resolve(resp);
                }
            });
        });
   }
   add() {
       this.num ++;
   }
}
export default HomeModel;
```

### 6. 同一个模块中异步方法可以相互调用
> 假设有如下复杂场景， 同步方法init调用异步方法A, 异步方法A中顺序调用异步方法B, C, ..., 异步方法C 中调用同步方法D

```js
@service(module.id)
class AsyncModel extends Model {
    init() {
        this.ajaxA();
    }
   * ajaxA() { // 顺序执行异步b,c, promise;
        const ret = yield this.ajaxB(); // 可以有返回值
        console.log(ret) // 123;
        yield this.ajaxC();
        yield Promise.resolve(22);
   }
   * ajaxB() {
       // async body, 可以获取和设置this中的属性
      return 123
   }
   * ajaxC() {
       // async body, 可以获取和设置this中的属性
        this.syncD();
        // async body;
        // yield this.ajaxE(); // 可以直接调用异步E方法。
   }
    syncD() {
       // body
    }
    async ajaxE() {
        // await promise;
        // async body
    }

}
export default AsyncModel;

```
1. 模块中的同步方法可以理解为一个返回promise 实例的方法；
2. 异步方法每执行一步yield， 所有数据修改都会同步到页面；
3. 如果不太关心执行过程中的数据同步问题， 可以用async/await 替换generator方法。不过不建议这样做。

## 最佳实践
### 1. 应用场景
> redux-spring 非常适用于具有复杂交互逻辑的页面/组件， 或者页面之间有数据交互/共享等场景
> 不适用于循环列表项中的复杂组件
### 2. ui展示层与数据分离
>页面展示和数据可以进一步拆分， 页面中不包含任何逻辑处理， 数据层完全基于model
>以面向对象的方式进行开发， 对外提供api接口和数据文档，并且一份model可以适配多平台，比如同时适配移动端h5 和pc端页面， 
>多人协作的时候， 可以ui 和数据完全交给不同人负责，高效完成需求， 同时可以保证代码风格统一。

## 自己构建
如果需要定制api GitHub 上克隆代码并自己构建。
```shell
git clone https://github.com/sampsonli/redux-spring node_modules/redux-spring
cd node_modules/redux-spring
npm install
npm run build
```
## 参考项目
一个整合最新react17+webpack5通用模板项目[react_template_project](https://github.com/sampsonli/react_template_project)


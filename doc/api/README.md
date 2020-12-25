---
sidebar: auto
---

# API 参考

## redux-spring 
- (default) 注入store

``` js
import spring from 'redux-spring'
const store = createStore();
spring(store);
```

## 定义model
 - example
  ``` js
  @service('namespace')
  class ModelA extends Model {
    @inject(UserModel) user;
  }
  ```

### service 定义model

- 类型: `Function`
- 参数: 'ns' 模块名字空间



 ``` js
 @service('namespace')
 class ModelA {
 }
 ```
### Model 接口定义
- 主要用来给模块实例/模块提供api， 定义模块的时候继承此接口

1. ns 模块名字空间, 定义在类上
    - 类型: `string`
2. setData 类实例方法，批量给实例属性设置新值
    - 类型： `Function`
3. reset 类实例方法，重置模块中数据到初始值
    - 类型： `Function`
### @inject 模块注入
- 类型: `Function`
- 参数： Class 需要注入实例的模块类

### @resource 模块注入
- 类型: `string`
- 参数： 需要注入实例的模块名


## useModel
- 类型: `Function`
- 参数: Model 模块类名
- 返回: 模块实例

  react-hooks 获取模块实例

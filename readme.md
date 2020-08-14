# redux-spring
## What is redux-spring?
redux-spring 是一个react+redux模块化管理工具， 基于redux 进一步封装， 更方便使用， 同时结构更清晰
## 为什么使用 redux-spring?
react+redux 组合已经是目前主流开发模式， 但是使用原生redux开发会遇到很多痛点
1. 组件很容易做成按需加载，而action,reducer 不太方便做成异步加载， 意味着假如一个很大的应用，用户只访问一个页面， 会把很多没必要的业务代码一次性加载进来， 导致页面加载缓慢
2. 使用原生redux开发，需要维护大量常量，还有多个文件， 文件来回切换比较繁琐， 而且维护起来非常麻烦
3. 原生redux开发可读性差， 对于新手很难理解里面的操作逻辑
4. 开发的时候，修改action,reducer里面的内容很难保留老数据，大部分都情况下都要刷新页面
5. 使用redux 很难做类型检测， 自动代码提示功能很弱
6. 更方便拆分视图和业务层， 更好的多人协作

## redux-spring 解决的问题
1. 模块化
2. 无需定义各种常量， 多个文件
3. 模块无缝按需加载
4. 完全基于面向对象思想，使用简单
5. 完美支持异步操作
6. 可读性强
7. 完美支持ts开发， 拥有完善的自动代码提示
8. 兼容老版本浏览器（保证react+redux版本同时支持）

## 参考项目
相关使用方法可以参考

1.  [reactwithie8（兼容老版本浏览器版本）](https://github.com/sampsonli/reactwithie8)
2.  [reactwebpack4（现代浏览器版本）](https://github.com/sampsonli/reactwebpack4)

## 快速开始
> 实现一个简单的demo， 一个页面有两个按钮，一个点击+1， 一个点击-1，输出当前数字
1. 安装redux-spring
~~~bash
yarn add redux-spring
~~~
2. 定义store并注入到spring中
~~~javascript
import spring from 'redux-spring';
const store = createStore();
spring(store, asyncReducers); // asyncReducers是老版本维护的所有reducer， 新开项目可以不用传
~~~
4. 定义model
~~~javascript
import {Controller} from 'redux-spring';
@Controller('demo')
class DemoModel {
    number = 100;

    addOne() {
		this.number = this.number + 1;
	}

    minusOne() {
		this.number--;
	}
}
export default DemoModel;
~~~
>定义model主要由三部分组成
	1. 名字空间;
		>名字空间必须全局唯一,  声明名字空间有多种方式， 后面有更详细说明
	2. 类属性;
		>类中的属性会同步到redux store中，类属性可以是私有属性（推荐），也可以是公共属性， 私有属性同步到redux store中会移除'#'， 比如上面案例中 '#number' 保存到redux中会变为'number'
	3. 类方法;
		>类方法总this代表当前model对于在store中state的副本， 可以直接读取对应属性也可以修改对应属性， 每次修改完成后会同步到store中state， <font color="red">切记</font>类方法不能为箭头方法， 否则this无法使用。
	4. 定义模块引入了注解， 需要安装相关babel插件

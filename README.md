# redux-spring 是什么？

redux-spring 是一个专为 react + redux 应用程序进行的二次封装库， 解决了基于原生开发redux 遇到的各种问题。 同时提供新的开发理念。
具有以下三大特点:
1. 模块化
2. 基于面向对象
3. 依赖注入
4. 完美异步解决方案
### 模块化
我们知道 基于原生redux开发， 一个模块中至少需要有 reducer， action， state， 还有各种常量，且分别定义在不同文件中， 在页面引入的时候
还需要定义mapStateToProps/mapActionToProps 等等， 总之实现一个模块需要写大量与业务无关的代码， 可读性也不直观， 并且经常要在需要在不同文件来回切换
，导致开发成本直线上升。

基于原生redux开发遇到的种种问题，redux-spring 引入模块化， 把之前state,reducer,action 整合到一起，定义为一个model， 通过各种封装，以及引入新开发思想，
定义一个模块并不会因为整合了所有功能而导致代码量急剧上升。

### 面向对象
面向对象带来的好处不言而喻，
 总的来说， 在数据层面上，更适合基于面向对象开发，只需要把把重心关注数据处理， 而不需要过多关注页面展示， 甚至前端开发可以进一步拆分： “静态页面” 与 “数据处理”
一套数据处理可以同时应用在多个场合，比如pc/h5。
基于面向对象开发还可以带来一系列好处， 完美兼容typescript，很方便提供api文档， 不用再为原生redux开发找对应action/reducer而烦恼。
### 依赖注入
react-spring 基本理念参考了后端java 中spring框架概念， DI（依赖注入）核心思想。 所有model都是单实例的，统一由框架创建与维护， 模块之间可以相互依赖， 由react-spring自动注入
用户只需通过注解标注类型即可，这样模块之间数据共享就变得特别方便。


### 异步操作
异步操作在开发过程中特别常见， 基本上所有主流库都有不错的支持， 为什么称***完美***, 肯定有自己的一套特殊的解决方案，
当遇到多个顺序异步操作， 而且异步操作之间有数据修改的情况下可以把修改的数据同步到页面中，而不需要做额外的操作，能够和面向对象完美融合
 
 > redux-spring 的优势远不止这些，这里只是列出了主要的优点，比如可读性好，学习成本低等等 

1. [初始化](https://github.com/sampsonli/redux-spring/blob/master/doc/installation.md)
2. [快速开始](https://github.com/sampsonli/redux-spring/blob/master/doc/guide/README.md)
3. [API文档](https://github.com/sampsonli/redux-spring/blob/master/doc/api/README.md)

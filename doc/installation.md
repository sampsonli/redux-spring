## 安装
### NPM
npm install redux-spring --save
### Yarn
yarn add redux-spring

## 使用

1. 注入store
```js
import store from './store'
import spring from 'redux-spring'

spring(store);
```

## 自己构建
如果需要定制api GitHub 上克隆代码并自己构建。

git clone https://github.com/sampsonli/redux-spring node_modules/redux-spring
cd node_modules/redux-spring
npm install
npm run build

使用方法
------------

（1） 安装 [酷 Q](https://cqp.cc/) 及 [CoolQ HTTP API 插件](https://github.com/richardchien/coolq-http-api)

运行 酷 Q ，启用 cqhttp 插件，配置 websocket 服务如下：

```json
{
    "use_ws": true,
    "ws_host": "127.0.0.1",
    "ws_port": 6700,
    "access_token": "mytoken",
}
```

（2） 用谷歌或火狐浏览器打开 https://pandolia.net/js-bot 网址，在输入框中输入以下代码注册事件处理的回调函数：

```typescript
handler.onCqEvent = function (data, api) {
    console.log(JSON.stringify(data, null, '    '));
}
```

事件处理回调函数中的第一个参数 data 是事件数据，支持的事件列表及字段说明详见 [cqhttp 事件列表](https://cqhttp.cc/docs/4.12/#/Post?id=%E4%BA%8B%E4%BB%B6%E5%88%97%E8%A1%A8) 。

事件处理回调函数中的第二个参数 api 是用来调用 cqhttp-api 的函数，示例如下：

```typescript
api('send_like', { user_id: 158297369 }).then(() => console.log('ok'));
```

其他 cqhttp-api 见 [cqhttp API 列表](https://cqhttp.cc/docs/4.12/#/API?id=api-%E5%88%97%E8%A1%A8) ，调用时需注意下面两个问题：

* 第一个参数为 cqhttp-api 名称，前面不含斜杠 "/"
* 第二个参数为 cqhttp-api 参数，与用户 id 相关的字段全部采用 number 类型（js-bot 内部采用的是 string 类型）

（3） 开发模式

下载本项目源码，运行 yarn install; yarn start ，修改 src/myhandler.ts 文件。

用户协议及许可
---------------

使用之前请先阅读 [用户协议及许可](./LISENCE)

特别致谢
--------------

感谢酷 Q 软件和 Richard Chien 开发的 [coolq-http-api](https://github.com/richardchien/coolq-http-api) 。
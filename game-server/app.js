let pomelo        = require('pomelo');

let routeUtil     = require('./app/util/routeUtil');
let sessionFilter = require('./app/filters/sessionFilter');
let storageUtil   = require('./app/util/storageUtil');

/**
 * Init app for client.
 */
let app = pomelo.createApp();
app.set('name', 'PomeloFramework');

// app configuration
app.configure('production|development', function(){
  // 房间列表
  app.roomMap = new Map()
  // socket配置
  app.set('connectorConfig', {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 3,
      useDict : true,
      useProtobuf : true
  });
  // room服务器路由
  app.route('room', routeUtil.roomRoute);

  app.before(pomelo.filters.toobusy());
  app.filter(pomelo.filters.time());
  app.filter(pomelo.filters.timeout());
  app.filter(pomelo.filters.serial());
  app.rpcFilter(pomelo.rpcFilters.rpcLog())
  app.rpcFilter(pomelo.rpcFilters.toobusy())

  // 启动监控
  app.enable('systemMonitor');
  // 实现在线人数监控
  let onlineUser = require('./app/modules/onlineUser');
  app.registerAdmin(onlineUser, {app: app});
});

app.configure('production|development', 'room', function(){
  // 判断登陆是否失效
  app.filter(sessionFilter());
  // 重启房间恢复
  let roomKeeper = require('./app/components/roomKeeper');
  app.load(roomKeeper)
});

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
// 存储管理初始化
storageUtil.configure(app, () => {
  // start app
  app.start();
})
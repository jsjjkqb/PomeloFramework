let CheckUtil = require('../util/checkUtil');

module.exports = function() {
    return new Filter();
  }
  
let Filter = function() {

};

Filter.prototype.before = function (msg, session, next) {
    // 检查登陆是否失效
    let result = CheckUtil.checkSession(session);
    if (!result.isOK) {
        return next(null, result.msg);
    }
    next();
};

Filter.prototype.after = function (err, msg, session, resp, next) {
    next(err);
};
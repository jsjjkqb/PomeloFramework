const Code = require('../util/code');

/**
 * 用于检测的类型字符串，均为 typeof 的结果
 */
module.exports.CheckType = {
    String : 'string',
    Number : 'number',
    Object : 'object',
    Boolean: 'boolean'
}

/**
 * 检查参数完整性和合法性
 * @param {*} param 所有参数
 * @param {*} checkMap 检查项目,第0位为检查类型 { paramKey : [CheckType, ...optionValue] }
 */
module.exports.checkParamValue = function(param, checkMap) {
    var that = this;
    var keys = Object.keys(checkMap);

    // 完整性检查
    var firstLackKey = "";
    var completenessCheck = keys.every(function (key) {
        if (!param.hasOwnProperty(key)) {
            firstLackKey = key;
            return false;
        }
        return true;
    })
    if (!completenessCheck) {
        var res = Code.CHECK_FAIL;
        res.msg = "缺失参数:" + firstLackKey
        return {
            isOK: false,
            msg: res
        }
    }

    // 合法性检查(类型和可选数值)
    var firstIllegalKey, expectValues = null;
    var legalityCheck = keys.every(function (key) {
        var paramValue = param[key];
        var optionValues = checkMap[key];
        // a.类型检测
        var typeValue = optionValues[0];            // 检查类型值    
        var needCheckType = that.isCheckType(typeValue); // 判断是否需要检测类型
        if (needCheckType && typeof(paramValue) !== typeValue) {
            firstIllegalKey = key;
            expectValues = "类型应为:" + typeValue;
            return false;
        }
        // b.数值检测
        optionValues.splice(0, 1)    // 除去第一个数，若剩下的数组长度为0则不做数值检测
        if (optionValues.length > 0 && optionValues.indexOf(paramValue) < 0) {
            firstIllegalKey = key;
            expectValues = "可选参数:" + optionValues.join("/");
            return false;
        }
        return true;
    })
    if (!legalityCheck) {
        var res = Code.CHECK_FAIL;
        res.msg = "参数不合法:" + firstIllegalKey + ",[" + expectValues + "]"
        return {
            isOK: false,
            msg: res
        }
    }
    // 检查通过
    return { isOK: true }
}

/**
 * 是否为可判断类型,使用值来检测是否需要检测类型
 * @param {*} typeValue 用于检测类型的值    
 */
module.exports.isCheckType = function(typeValue) {
    for (const key in this.CheckType) {
        if (this.CheckType.hasOwnProperty(key)) {
            if (this.CheckType[key] == typeof typeValue) {
                return true   ;
            }
        }
    }
    return false;
}

/**
 * 检查session（检查是否过期）
 * @param {*} session 会话
 */
module.exports.checkSession = function(session) {
    if (!session.uid) {
        return {
            isOK: false,
            msg: Code.LOGIN.SESSION_EXPIRE
        }
    }
    return {isOK: true};
}
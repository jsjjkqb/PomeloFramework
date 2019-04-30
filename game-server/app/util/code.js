module.exports = {
    OK                      : result(200),
    FAIL                    : result(601, '服务器处理失败'),
    CHECK_FAIL              : result(602, '检查失败'),
    LOGIN: {
        SESSION_EXPIRE      : result(701, '登陆失效'),
    },
    USER: {

    },
    PLAYER: {
        NO_CARD_ERROR       : result(851, '您没有这手牌'),
        CHI_BUILD_ERROR     : result(852, '不能组成顺子'),
        CHI_ERROR           : result(853, '吃牌错误'),
        PENG_BUILD_ERROR    : result(854, '不能组成碰牌'),
        PENG_ERROR          : result(855, '碰牌错误'),
        GANG_BUILD_ERROR    : result(856, '不能组成杠牌'),
        GANG_ERROR          : result(857, '杠牌错误'),

    },
    ROOM: {
        ENOUGH_PLAYER       : result(901, '房间已满人'),
        HAD_BEGIN           : result(902, '房间已开始'),
        NO_USER             : result(903, '房间不存在该玩家'),
    },
    RUN: {

    },

    makeResult(errMsg = null) {
        return {
            isOK    : !errMsg || errMsg.code == 200,
            errMsg  : errMsg
        }
    }
}

function result(code, msg = '') {
    return {
        code: code,
        msg : msg
    }
}
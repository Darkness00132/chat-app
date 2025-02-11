const generateMessages = (message,username)=>{
    return {
        text:message,
        createdAt:new Date().getTime(),
        username,
    }
}

module.exports = {
    generateMessages
}
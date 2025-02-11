users = []

//addUser removeUser getUser getUsersInRoom

const addUser = ({id,username,room}) =>{
    //clean data
    username = username.trim()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room) {
        return {
            error:'username and room are required'
        }
    }

    //check for existing user in same room
    const existingUser = users.find(user => {
        return user.username === username && user.room === room
    })

    if(existingUser) {
        return {
            error:"username is used in that room"
        }
    }

    //add user if all goods
    const user = {
        id,
        username,
        room
    }
    users.push(user)

    return {user}
}

const removeUser = ({id})=>{
    //get user from users
    const user = users.findIndex((user)=>{
        return user.id === id
    })

    //check user exist
    if(user !== -1) {
        return users.splice(user,1)[0]
    }
}

const getUser = (id) => {

    return users.find((user)=>{
        return user.id === id
    })
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()

    return users.filter((user) => {
        return user.room === room
    })
}

module.exports = {
    getUsersInRoom,
    getUser,
    addUser,
    removeUser
}
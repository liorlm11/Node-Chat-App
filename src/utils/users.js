const users = []

const addUser = ({ id, username, room }) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user. (we dont want 2 users with the same username in the same room)
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate username
    if(existingUser) {
        return {
            error: 'Username is already in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user) //pushing the new user to the users array
    return { user } //everything  went well so we return an object with the user
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0] // splice allow us to remove items from an array by their index, and the second argument is the number of items we'd like to remove (in this case we just want to remove one, the user). the splice function returns an array with all the items that we removed from it (in our case is just one item inside, so this is why we pick ths first item bucause we just want to return the user that we removed and not the array itself with the user inside,  so at the bottom the returnd value is the user we removed). part 168
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => { 
    room = room.trim().toLowerCase() 
    return users.filter((user) => user.room === room)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
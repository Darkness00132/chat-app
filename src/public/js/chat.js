const socket = io()

//elements
const $messageForm = document.querySelector('#formMessage')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const messageLocationTemplate = document.querySelector('#messageLocation-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

//autoscroll when new message comes in
autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    //height of new message
    const $newMessageStyles = getComputedStyle($newMessage)
    const $newMessageMargin = parseInt($newMessageStyles.marginBottom)
    const $newMessageHeight = $newMessage.offsetHeight + $newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-$newMessageHeight <= scrollOffset +10 ) {
        $messages.scrollTop = containerHeight
    }
}

socket.emit('join',{username, room},(error)=>{
    if(error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData',({room,users})=>{

    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    $sidebar.innerHTML = html
})

socket.on('message',(message)=>{

    const html = Mustache.render(messageTemplate,{
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a'),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(url)=>{

    const html = Mustache.render(messageLocationTemplate,{
        url:url.text,
        createdAt:moment(url.createdAt).format('h:mm a'),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(event)=>{
    event.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message = event.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()

        if(error) {
            return console.log(error)
        }
        console.log('message Delivered')
    })
})

$locationButton.addEventListener('click',()=>{

    if (!navigator.geolocation) {
        return alert('sharing location is not supported in your browser')
    }
    
    $locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        const {latitude,longitude} = position.coords

        socket.emit('sendLocation',`https://google.com/maps?q=${latitude},${longitude}`,()=>{
            console.log('location Shared')
            $locationButton.removeAttribute('disabled')
        })
    })
})
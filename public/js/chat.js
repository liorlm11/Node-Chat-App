const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')  // The $ sign is just a convention that let us know that this variable contains an element from the DOM.
const $messageFormInput = $messageForm.querySelector('input') // selcting the 'input' element from the its form 'messageForm' 
const $messageFormButton = $messageForm.querySelector('button') // selcting the 'button' element from the its form 'messageForm'
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//  Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options  
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) // Qs - query string,  location.search- gives us the search result thst ths user entered into the form and was sent,  'ignoreQueryPrefix: true' - ignores the signs like '?' 

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild  // we grad the last messsage that was sent

    // Height of the new message(the last that was sent)
    const newMessageStyles = getComputedStyle($newMessage) // get the styles of the new message
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin // '$newMessage.offsetHeight' doest take into account the margin, so we added that
    
    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage', (message) => {
    console.log(message)

    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value  // target- represents the target(in our case is the "form") that we are listeining for the event(the event is 'submit' in our case)..  full explanation part 156 minute 14
    // if(message === '') {
    //     $messageFormButton.removeAttribute('disabled')
    //     $messageFormInput.focus()
    //     return 
    // }
    socket.emit('sendMessage', message, (error) => { // this callback function will run after the server acknowledged the event
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        if(error) {
            return console.log(error)
        } 

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
 
    $sendLocationButton.setAttribute('disabled', 'disabled') 

    navigator.geolocation.getCurrentPosition((position) => {
        const locationCoords = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }
        socket.emit('sendLocation', locationCoords, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/' //redirect to the root of the site        
    }
})

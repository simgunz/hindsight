import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

const shell = document.createElement('main')
shell.className = 'shell'

const title = document.createElement('h1')
title.textContent = 'Hindsight'

const tagline = document.createElement('p')
tagline.textContent = 'Hands-free delayed video mirror'

shell.append(title, tagline)
app.append(shell)

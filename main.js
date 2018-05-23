'use strict'

const { h } = maquette
const { Router, Route, Link } = maquetteRouter
const hx = hyperx(h, { attrToProp: false })

const projector = maquette.createProjector()

const global = {
  basePath: '',
  name: 'Default Name'
}

const Home = () => {
  return {
    render: () => hx`
      <div key="route-home">
        <h1 class="title">Home</h1>
        <p>Hello, ${global.name}</p>
      </div>
    `
  }
}

const Form = () => {
  const handleInput = (e) => {
    global.name = e.target.value
  }

  return {
    render: () => hx`
      <div key="route-form">
        <h1 class="title">Form</h1>

        <div class="field">
          <label class="label" for="txt-name">Name</label>
          <div class="control">
            <input type="text" id="txt-name" name="name" class="input" placeholder="Name" value="${global.name}" oninput=${handleInput} />
          </div>
        </div>
      </div>
    `
  }
}

const main = {
  state: {
    tab: 'home'
  },

  components: {
    form: Form(),
    home: Home(),
  },

  render: () => hx`
    <div class="container">
      <div class="tabs">
        <ul>
          <li id="tab-home" classes=${{ 'is-active': main.state.tab === 'home' }}>
            ${ Link('a', { to: global.basePath + '/' }, [ 'Home' ]) }
          </li>
          <li id="tab-form" classes=${{ 'is-active': main.state.tab === 'form' }}>
            ${ Link('a', { to: global.basePath + '/form' }, [ 'Form' ]) }
          </li>
        </ul>
      </div>

      ${ Route({ path: global.basePath + '/', render: main.components.home }) }
      ${ Route({ path: global.basePath + '/form', render: main.components.form }) }
    </div>
  `
}

Router.subscribe(projector.scheduleRender)

window.addEventListener('locationchange', (e) => {
  const pathname = e.detail.pathname

console.log(global.basePath)
  if (pathname === global.basePath + '/form') {
    main.state.tab = 'form'
  } else {
    main.state.tab = 'home'
  }
}, false)

document.addEventListener('DOMContentLoaded', () => {
  const startPath = document.querySelector('link[rel=start]').getAttribute('href')
  global.basePath = startPath.endsWith('/') ? startPath.substr(0, startPath.length - 1) : startPath

  projector.append(document.body, main.render)
}, false)

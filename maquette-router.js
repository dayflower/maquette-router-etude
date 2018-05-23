'use strict'

{
  const { h } = maquette;

  /* location.js from hyperapp-router */
  const wrapHistory = (keys) => {
    return keys.reduce((next, key) => {
      const fn = history[key]

      history[key] = function(data, title, url) {
        fn.call(this, data, title, url)
        dispatchEvent(new CustomEvent("pushstate", { detail: data }))
      }

      return () => {
        history[key] = fn
        next && next()
      }
    }, null)
  }

  const Router = {
    pathname: window.location.pathname,
    previous: window.location.pathname,

    _scheduleRender: undefined,

    go: (to) => {
      if (to !== Router.pathname) {
        history.pushState(Router.pathname, '', to)
      }
    },

    subscribe: (scheduleRender) => {
      function handleLocationChange(e) {
        Router.pathname = window.location.pathname
        Router.previous = e.detail
          ? (window.location.previous = e.detail)
          : window.location.previous

        dispatchEvent(new CustomEvent("locationchange", { detail: { pathname: Router.pathname, previous: Router.previous } }))

        Router._scheduleRender()
      }

      Router._scheduleRender = scheduleRender

      const unwrap = wrapHistory(['pushState', 'replaceState'])

      addEventListener('pushstate', handleLocationChange)
      addEventListener('popstate', handleLocationChange)

      return () => {
        removeEventListener('pushstate', handleLocationChange)
        removeEventListener('popstate', handleLocationChange)
        unwrap()
      }
    }
  }

  /* parseRoute.js from hyperapp-router */

  const createMatch = (isExact, path, url, params) => {
    return {
      isExact: isExact,
      path: path,
      url: url,
      params: params
    }
  }

  const trimTrailingSlash = (url) => {
    for (var len = url.length; '/' === url[--len]; );
    return url.slice(0, len + 1)
  }

  const decodeParam = (val) => {
    try {
      return decodeURIComponent(val)
    } catch (e) {
      return val
    }
  }

  const parseRoute = (path, url, options) => {
    if (path === url || !path) {
      return createMatch(path === url, path, url)
    }

    const exact = options && options.exact
    const paths = trimTrailingSlash(path).split('/')
    const urls = trimTrailingSlash(url).split('/')

    if (paths.length > urls.length || (exact && paths.length < urls.length)) {
      return
    }

    for (var i = 0, params = {}, len = paths.length, url = ''; i < len; i++) {
      if (':' === paths[i][0]) {
        params[paths[i].slice(1)] = urls[i] = decodeParam(urls[i])
      } else if (paths[i] !== urls[i]) {
        return
      }
      url += urls[i] + '/'
    }

    return createMatch(false, path, url.slice(0, -1), params)
  }

  /* Route.js from hyperapp-router */
  const Route = (props) => {
    const location = Router
    const match = parseRoute(props.path, location.pathname, {
      exact: !props.parent
    })

    return (
      match &&
      props.render.render({
        match: match,
        location: location
      })
    )
  }

  /* Link.js from hyperapp-router */
  const getOrigin = (loc) => {
    return loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : '')
  }

  const isExternal = (anchorElement) => {
    // Location.origin and HTMLAnchorElement.origin are not
    // supported by IE and Safari.
    return getOrigin(location) !== getOrigin(anchorElement)
  }

  const Link = (tag, props, children) => {
    const to = props.to
    const onclick = props.onclick
    delete props.to
    delete props.location

    props.href = to
    props.onclick = (e) => {
      if (onclick) {
        onclick(e)
      }
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.altKey ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        props.target === '_blank' ||
        isExternal(e.currentTarget)
      ) {
      } else {
        e.preventDefault()

        if (to !== Router.pathname) {
          history.pushState(Router.pathname, '', to)
        }
      }
    }

    return h(tag, props, children)
  }

  window.maquetteRouter = {
    Router: Router,
    Route: Route,
    Link: Link
  }
}

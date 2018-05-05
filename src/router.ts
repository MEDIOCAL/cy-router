import xs, { Stream, MemoryStream } from 'xstream'
import { DOMSource, VNode } from '@cycle/dom'
import { HistoryInput, Location } from '@cycle/history'

export interface Sources {
  DOM: DOMSource;
  history: MemoryStream<Location>;
  props ?: Stream<any>;
}

export interface Sinks {
  DOM: Stream<VNode>;
  history: Stream<HistoryInput | string>;
  [propName: string] : Stream<any>;
}

export interface RouteComponent {
	(sources: Sources): Partial<Sinks>;
}

export interface Component {
	(): Promise<RouteComponent>;
}

export interface RouteResolution {
  path ?: string;
  component: Component;
  sources ?: any;
  wildpath ?: string
}

export interface RouteDefinitions {
	[path: string]: RouteResolution;	
}

function wildcard(routes: RouteDefinitions): RouteDefinitions {
	let newRoutes  = routes
	for(let key in routes) {
		if(newRoutes.hasOwnProperty(key)) {
			let ins = key.indexOf('/*')
			if(ins < 0) {
				newRoutes[key].path = key
			} else if(key.length > 2) {
				let index = ins
				newRoutes[key].path = key.slice(0, index)
				newRoutes[key].wildpath = key.slice(index, key.length)
			}
		}
	}
	return newRoutes
}
const resolveImplementation = (routes: RouteDefinitions, route: string) => {
	let newsRoutes = wildcard(routes)
	let router 
	let IndexRoute = newsRoutes["/*"]

	for(let key in newsRoutes) {
		if(newsRoutes.hasOwnProperty(key)) {
			if(newsRoutes[key].wildpath) {
				let newRoute = route.replace('/','')
				let wildpath = newRoute.slice(newRoute.indexOf('/') + 1, newRoute.length)
				newRoute = `/${newRoute.slice(0, newRoute.indexOf('/'))}`
				routes[key].wildpath = wildpath
				if( route === newsRoutes[key].path) {
					router = routes[key]
				} else if(newRoute && newRoute === newsRoutes[key].path){
					router = routes[key]
				} else {
					continue
				}

			} else {
				if( route === newsRoutes[key].path) {
					router = routes[key]
				} else {
					continue
				}
			}
		}
	}

	if(!router && !IndexRoute) {
		throw new Error('You do not configure this route')
	}

	const { 
		path, 
		component, 
		sources 
	} = (router || IndexRoute)

	return {
		path,
		component,
		sources
	}
}

export const getComponent = <T>(component: T) => async () => await Promise.resolve(component) 

export const router = (routes: any) => (path: string) => resolveImplementation(routes, path)

export default function Router(sources: Sources, resolve: (path: string) => RouteResolution): Sinks {
	const history$ = sources.history
	const app$ = history$
				.map(location => resolve(location.pathname))
              	.map( ({ component }) => {
                  return xs.fromPromise(
                      component()
                      .then( (Component: any) => Component({ ...sources}))
                  )
              	})
              	.flatten()
    const appDom$ = app$.map( (app: any) => app.DOM).flatten()

    return {
    	DOM: appDom$,
    	history: app$.map( (app: any) => app.history)
    }
}
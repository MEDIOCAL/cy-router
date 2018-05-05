# cy-router
cyclejs-components-router

router.js
```
import { router, getComponent } from '../utils/router'

const routes = {
	'/': {
		component: getComponent(Home)
	},
	'/input': {
		component: getComponent(Input)
	},
	'/checkbox': {
		component: getComponent(Checkebox)
	},
	'/radio': {
		component: getComponent(Radio)
	},
	'/select': {
		component: getComponent(Select)
	},
	'/switch': {
		component: getComponent(Switch)
	},
	'/menu': {
		component: getComponent(Menu)
	},
	'/paging': {
		component: getComponent(Paging)
	},
	'/editor': {
		component: getComponent(Editor)
	},
	'/*': {
		component: getComponent(Home)
	}
}

export const resolve = router(routes)
```
main.js
```
interface Sources {
	DOM: DOMSource;
	history: MemoryStream<Location>;
}

interface Sinks {
	DOM: Stream<VNode>;
	history: Stream<HistoryInput | string>;
}
function main(sources: Sources): Sinks {
  ...
  import { resolve } from "./routes"
  import Router from "./utils/router"

  const router = Router(sources, resolve)
  const appDom$ = router.DOM
  const value$ = xs.combine(siderDom$, appDom$)
  ...
}
run(main, {
  DOM: makeDOMDriver('#app'),
  history: captureClicks(makeHashHistoryDriver())
})

```

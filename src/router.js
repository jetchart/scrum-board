import Vue    from 'vue'
import Router from 'vue-router'
import Home   from './components/Home'
import BoardContext   from './components/BoardContext'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/app/',
      name: 'Home',
      component: Home
    },
    {
      path: '*',
      redirect: {name: 'Home'},
    },
    {
      path: '/app/board/:room',
      component: Home
    },
    {
      name: 'board',
      path: '/app/board/:room/:name',
      component: BoardContext
    },
  ],
})

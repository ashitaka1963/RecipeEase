import { createRouter, createWebHistory } from 'vue-router'
import IngredientView from '../views/IngredientView.vue'
import RecipeView from '../views/RecipeView.vue'
import CalendarView from '../views/CalendarView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'IngredientView',
      component: IngredientView
    },
    {
      path: '/ingredient',
      name: 'IngredientView',
      component: IngredientView
    },
    {
      path: '/recipeView',
      name: 'RecipeView',
      component: RecipeView
    },
    {
      path: '/calendarView',
      name: 'CalendarView',
      component: CalendarView
    }
  ]
})

export default router

/**
 * daily-menu service
*/

import { factories } from "@strapi/strapi";
const DAILY_MENU_SERVE = "api::daily-menu.daily-menu";

export default factories.createCoreService(DAILY_MENU_SERVE, () => ({
  async showPrices(ctx) {
    const { First, MainCourse, Dessert } = ctx;
    let first_dish = 0;
    let second_dish = 0;
    let third_dish = 0;
    if (First != null) {
      first_dish = First.Price;
    }
    if (MainCourse != null) {
      second_dish = MainCourse.Price;
    }
    if (Dessert != null) {
      third_dish = Dessert.Price;
    }

    return first_dish + second_dish + third_dish;
  },
  async addTaxes(dishes){
    

  }
}));

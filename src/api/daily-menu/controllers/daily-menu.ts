/**
 * daily-menu controller
 */

import { factories } from "@strapi/strapi";
const DAILYSERVE = "api::daily-menu.daily-menu";
export default factories.createCoreController(DAILYSERVE, () => ({
  async lessAllergens(ctx) {



    
  },
}));

"use strict";
/**
 * daily-menu service
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const DAILY_MENU_SERVE = "api::daily-menu.daily-menu";
exports.default = strapi_1.factories.createCoreService(DAILY_MENU_SERVE, () => ({
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
    async addTaxes(ctx) {
        const TAXES = 1.21;
        const { Price } = ctx;
        return (Price * TAXES).toFixed(2);
    },
}));

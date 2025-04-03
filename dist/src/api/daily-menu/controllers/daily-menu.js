"use strict";
/**
 * daily-menu controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const DAILYSERVE = "api::daily-menu.daily-menu";
exports.default = strapi_1.factories.createCoreController(DAILYSERVE, () => ({
    async lessAllergens(ctx) {
    },
}));

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'GET',
            path: '/daily-menu/:Name',
            handler: 'daily-menu.lessAllergens',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/daily-menu/',
            handler: 'daily-menu.mostPopulars',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};

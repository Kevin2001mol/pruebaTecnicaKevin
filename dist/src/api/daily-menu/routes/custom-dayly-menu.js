"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'PUT',
            path: '/daily-menu/',
            handler: 'daily-menu.lessAllergens',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};

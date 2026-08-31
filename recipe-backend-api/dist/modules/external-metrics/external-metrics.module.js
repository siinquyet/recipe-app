"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalMetricsModule = void 0;
const common_1 = require("@nestjs/common");
const external_metrics_controller_1 = require("./external-metrics.controller");
const external_metrics_service_1 = require("./external-metrics.service");
let ExternalMetricsModule = class ExternalMetricsModule {
};
exports.ExternalMetricsModule = ExternalMetricsModule;
exports.ExternalMetricsModule = ExternalMetricsModule = __decorate([
    (0, common_1.Module)({
        controllers: [external_metrics_controller_1.ExternalMetricsController],
        providers: [external_metrics_service_1.ExternalMetricsService],
        exports: [external_metrics_service_1.ExternalMetricsService],
    })
], ExternalMetricsModule);
//# sourceMappingURL=external-metrics.module.js.map
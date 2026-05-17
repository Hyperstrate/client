import { type RouteParamsRawGeneric, type RouteRecordRaw } from 'vue-router'

export type Route = RouteRecordRaw & { params?: RouteParamsRawGeneric }

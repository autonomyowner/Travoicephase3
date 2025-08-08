"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapGraphSchema = exports.MapEdgeSchema = exports.MapNodeSchema = exports.EmotionEnum = void 0;
const zod_1 = require("zod");
exports.EmotionEnum = zod_1.z.enum(['positive', 'neutral', 'negative']);
exports.MapNodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    label: zod_1.z.string(),
    type: zod_1.z.enum(['root', 'thought', 'action', 'emotion']).optional(),
    emotion: exports.EmotionEnum.optional(),
    priority: zod_1.z.number().int().min(0).max(5).optional(),
    position: zod_1.z.object({ x: zod_1.z.number(), y: zod_1.z.number() }).optional()
});
exports.MapEdgeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    source: zod_1.z.string(),
    target: zod_1.z.string(),
    label: zod_1.z.string().optional(),
    curve: zod_1.z.enum(['flexible', 'straight']).optional(),
    line: zod_1.z.enum(['dashed', 'solid']).optional()
});
exports.MapGraphSchema = zod_1.z.object({
    nodes: zod_1.z.array(exports.MapNodeSchema),
    edges: zod_1.z.array(exports.MapEdgeSchema)
});

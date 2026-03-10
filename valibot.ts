import * as v from 'valibot';
import {safeParse} from "valibot";
import type {Todos} from "./queries.ts";

type ValidationResult =
    | { success: true; data: TodoOutput }
    | { success: false; errors: v.FlatErrors<undefined> };
type TodoOutput = v.InferOutput<typeof DatabaseTodoSchema>;

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

const ClientTodoSchema = v.strictObject({
    title: v.pipe(v.string(), v.minLength(1)),
    content: v.nullable(v.string()),
    due_date: v.nullable(v.pipe(v.string(), v.regex(dateOnlyRegex))),
    done: v.optional(v.boolean(), false)
})

const DatabaseTodoSchema = v.pipe(
    ClientTodoSchema,
    v.transform((schema) => ({
        $title: schema.title,
        $content: schema.content,
        $due_date: schema.due_date,
        $done: (schema.done ? 1 : 0) as 0 | 1
    }))
);

const PartialDataSchema = v.pipe(
    v.partial(ClientTodoSchema),
    v.transform((schema) => ({
        $title: schema.title,
        $content: schema.content,
        $due_date: schema.due_date,
        $done: (schema.done !== undefined ? (schema.done ? 1 : 0) : undefined)
    }))
)

export function validateSchema(data: any): ValidationResult {
    const result = v.safeParse(DatabaseTodoSchema, data)
    if (result.success) {
        return {success: true, data: result.output};
    } else {
        return {success: false, errors: v.flatten(result.issues)};
    }
}


export function validateProperty(data: any): ValidationResult {
    const result = v.safeParse(PartialDataSchema, data);
    if (result.success) {
        return {success: true, data: result.output as TodoOutput};
    } else {
        return {success: false, errors: v.flatten(result.issues)};
    }
}
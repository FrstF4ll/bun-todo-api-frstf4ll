import * as v from 'valibot';

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

const ClientTodoSchema = v.strictObject({
    title: v.pipe(v.string(), v.minLength(1)),
    content: v.nullable(v.string()),
    due_date: v.nullable(v.pipe(v.string(), v.regex(dateOnlyRegex))),
    done: v.optional(v.boolean(), false)
})

type ClientTodo = v.InferOutput<typeof ClientTodoSchema>

const toSQLBindings = (data: Partial<ClientTodo>) => ({
    $title: data.title,
    $content: data.content ?? null,
    $due_date: data.due_date ?? null,
    $done: data.done !== undefined ? (data.done ? 1 : 0) as 0 | 1 : undefined
})

const fullDataSchema = v.pipe(ClientTodoSchema, v.transform(data => toSQLBindings(data)))
const PartialDataSchema = v.pipe(v.partial(ClientTodoSchema), v.transform(toSQLBindings))

type Schema = typeof fullDataSchema | typeof PartialDataSchema

function validate(schema: Schema, data: unknown) {
    const result = v.safeParse(schema, data)
    return result.success
        ? {success: true, data: result.output}
        : {success: false, errors: v.flatten(result.issues)};
}

export const validateSchema = (data: unknown) => validate(fullDataSchema, data)
export const validateProperty = (data: unknown) => validate(PartialDataSchema, data)

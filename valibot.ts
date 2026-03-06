import * as v from 'valibot';
import {string} from "valibot";


type ValidationResult =
    | { success: true; data: TodoOutput }
    | { success: false; errors: v.FlatErrors<undefined> };
type TodoOutput = v.InferOutput<typeof TodoSchema>;

const dueDateSchema = v.pipe(v.string(), v.isoDate())

const DoneSchema = v.pipe(v.boolean(), v.transform((val) =>
    val ? 1 : 0))

const TodoSchema = v.strictObject({
    $title: v.string(),
    $content: v.string(),
    $due_date: dueDateSchema,
    $done: DoneSchema
})

export function validateSchema(data: any): ValidationResult {
    const result = v.safeParse(TodoSchema, data)
    if (result.success) {
        return { success: true, data: result.output };
    } else {
        return { success: false, errors: v.flatten(result.issues) };
    }
}


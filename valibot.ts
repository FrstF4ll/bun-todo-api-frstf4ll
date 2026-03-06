import * as v from 'valibot';
import {string} from "valibot";


export function validateSchema(data: any) {
    const DoneSchema = v.pipe(v.boolean(), v.transform((val) =>
        val ? 1 : 0))
    const dueDateSchema = v.pipe(v.string(), v.isoDate())
    const TodoSchema = v.strictObject({
         $title: v.string(),
         $content: v.string(),
         $due_date: dueDateSchema,
         $done: DoneSchema
        })
        const result = v.safeParse(TodoSchema, data)
    if (result.success) {
        return { success: true, data: result.output };
    } else {
        return { success: false, errors: v.flatten(result.issues) };
    }
}


import { t } from "elysia";

export const CreateOwnerDto = t.Object({
    name: t.String({ minLength: 2 }),
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 8 }),
});

export type CreateOwner = typeof CreateOwnerDto.static;

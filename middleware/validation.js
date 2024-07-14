const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json");
const ExpressError = require("../expressError");

async function validateBook (req, res, next) {
    const schema = await jsonschema.validate(req.body, bookSchema);
    if (!schema.valid) {
        const errors = schema.errors.map((e) => e.stack);
        const e = new ExpressError(errors, 400)
        return next(e)
    }
    next()
}

module.exports = validateBook
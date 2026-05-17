/* eslint-disable @typescript-eslint/no-empty-object-type */
type JsonScalar = string | number | boolean | null | undefined | JsonObject | JsonArray
interface JsonObject {
  [k: string]: JsonScalar
}
interface JsonArray extends Array<JsonScalar> {}

type ReadonlyJsonScalar = string | number | boolean | null | undefined | ReadonlyJsonObject | ReadonlyJsonArray
interface ReadonlyJsonArray extends Array<ReadonlyJsonScalar> {}

interface ReadonlyJsonObject {
  readonly [k: string]: ReadonlyJsonScalar
}

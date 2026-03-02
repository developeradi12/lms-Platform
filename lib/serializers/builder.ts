import { serializeMongo } from "./mongo"
import { pickShape } from "./shape"

export function buildSerializer<T>(shape?: (keyof T)[]) {
  return (doc: any): T => {
    const plain = serializeMongo(doc)

    if (!shape || shape.length === 0) {
      return plain as T
    }

    return pickShape<T>(plain, shape)
  }
}
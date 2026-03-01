export function serializeMongo<T>(doc: any): T {
  if (!doc) return doc

  const plain = JSON.parse(JSON.stringify(doc))

  return plain
}

/*This automatically:

✔ converts ObjectId → string
✔ converts Date → string
✔ removes mongoose prototype

No manual _id: String() everywhere. */
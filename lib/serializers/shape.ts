export function pickShape<T>(doc: any, shape: (keyof T)[]): T {
  const result: any = {}

  shape.forEach(key => {
    result[key] = doc[key]
  })

  return result
}
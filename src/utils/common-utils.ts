function compose<T, U, V, Y>(f: (x: T) => U, g: (y: Y) => T, h: (z: V) => Y): (x: V) => U {
  return (x: V) => f(g(h(x)))
}

function partition(arr: any, filter: any) {
  return arr.reduce(
    (r: any, e: any, i: any, a: any) => {
      r[filter(e, i, a) ? 0 : 1].push(e)
      return r
    },
    [[], []]
  )
}

export const CommonUtils = {
  compose,
  partition,
}

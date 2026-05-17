export function componentPath(path: string): string {
  if (path.startsWith('/')) {
    return `.${path}`
  }

  if (path.startsWith('./')) {
    return path
  }

  return `./${path}`
}

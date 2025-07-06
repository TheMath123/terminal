export const createPathResolver = (currentPath: string) => {
  return (path: string): string => {
    if (path.startsWith("/system")) {
      return path
    }
    if (path.startsWith("/")) {
      return "/system" + path
    }
    if (path === "..") {
      const parts = currentPath.split("/").filter((p) => p)
      parts.pop()
      const newPath = "/" + parts.join("/")
      return newPath === "/" ? "/system" : newPath
    }
    if (path === ".") {
      return currentPath
    }
    if (currentPath === "/system") {
      return `/system/${path}`
    }
    return `${currentPath}/${path}`
  }
}

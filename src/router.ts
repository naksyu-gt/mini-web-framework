export type MatchResult = {
  params: Record<string, string>;
};

export function matchPath(
  routePath: string,
  actualPath: string,
): MatchResult | null {
  const routeParts = splitPath(routePath);
  const actualParts = splitPath(actualPath);

  if (routeParts.length !== actualParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < routeParts.length; i++) {
    const routePart = routeParts[i];
    const actualPart = actualParts[i];

    if (routePart.startsWith(":")) {
      const paramName = routePart.slice(1);
      params[paramName] = decodeURIComponent(actualPart);
      continue;
    }

    if (routePart !== actualPart) {
      return null;
    }
  }

  return { params };
}

function splitPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

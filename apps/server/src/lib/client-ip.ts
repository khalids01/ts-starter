export type RequestIpLookup = (
  request: Request,
) => { address?: string | null } | null;

type ClientIpInput = {
  request: Request;
  requestIP?: RequestIpLookup;
};

type ClientIpResult = {
  ip: string | null;
  trustedProxyHeaders: boolean;
};

function normalizeIp(ip: string | null | undefined) {
  if (!ip) {
    return null;
  }

  const trimmed = ip.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("::ffff:")) {
    return trimmed.slice("::ffff:".length);
  }

  return trimmed;
}

function firstForwardedIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (!forwardedFor) {
    return null;
  }

  return normalizeIp(forwardedFor.split(",")[0]);
}

function proxyHeaderIp(headers: Headers) {
  return (
    normalizeIp(headers.get("cf-connecting-ip")) ??
    firstForwardedIp(headers) ??
    normalizeIp(headers.get("x-real-ip"))
  );
}

function isPrivateOrLoopbackIp(ip: string) {
  if (ip === "localhost" || ip === "::1") {
    return true;
  }

  const ipv4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [, aRaw, bRaw] = ipv4;
    const a = Number(aRaw);
    const b = Number(bRaw);

    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }

  const lower = ip.toLowerCase();
  return (
    lower === "fc00" ||
    lower === "fd00" ||
    lower.startsWith("fc") ||
    lower.startsWith("fd")
  );
}

export function getClientIp(input: ClientIpInput): ClientIpResult {
  const peerIp = normalizeIp(input.requestIP?.(input.request)?.address);

  if (!peerIp) {
    return {
      ip: proxyHeaderIp(input.request.headers),
      trustedProxyHeaders: true,
    };
  }

  if (!isPrivateOrLoopbackIp(peerIp)) {
    return {
      ip: peerIp,
      trustedProxyHeaders: false,
    };
  }

  return {
    ip: proxyHeaderIp(input.request.headers) ?? peerIp,
    trustedProxyHeaders: true,
  };
}

export function getTrustedCountry(headers: Headers, trustedProxyHeaders: boolean) {
  if (!trustedProxyHeaders) {
    return null;
  }

  return (
    headers.get("cf-ipcountry") ??
    headers.get("x-vercel-ip-country") ??
    headers.get("x-country-code") ??
    null
  );
}

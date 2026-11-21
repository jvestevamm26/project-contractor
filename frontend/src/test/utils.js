// Builds an unsigned JWT-shaped string; AuthContext only base64-decodes the payload.
export function fakeToken(payload) {
  const encode = (obj) => btoa(JSON.stringify(obj))
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.sig`
}

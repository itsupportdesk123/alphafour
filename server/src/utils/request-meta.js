/** Request facts that services may record. Controllers pass this, so services never touch `req`. */
export function requestMeta(req) {
  return {
    requestId: req.id,
    userAgent: req.get('user-agent')?.slice(0, 200),
    referer: req.get('referer')?.slice(0, 300),
  };
}

# Changelog

All notable changes to this project are documented in this file.

## [1.1.0](https://github.com/SendLayer/sendlayer-node/compare/v1.0.3...v1.1.0) (2026-08-21)

### Bug Fixes

* `Emails.send()` no longer discards the plain-text body when both `text` and
  `html` are supplied. The payload used a single computed key, which could only
  ever emit one of the two fields. Both `HTMLContent` and `PlainContent` are now
  sent, and `ContentType` is reported as `HTML` whenever an HTML body is present.
* API error messages are no longer discarded. The client read `data.Error`, but
  SendLayer returns errors as `{"Errors": [{"Code": ..., "Message": ...}]}`, so
  every error surfaced a hardcoded default instead of the API's own text.
* Error mapping is no longer duplicated between a response interceptor and the
  `catch` block in `request()`. The interceptor threw first, so the catch block's
  branches were dead in production — yet the test suite stubs
  `interceptors.response.use`, so the interceptor never registered under test and
  those dead branches were the ones actually exercised. Both paths are now one
  `mapError()`, so tests and production run the same code.
* Response bodies are read defensively. `data.Error` threw a `TypeError` on a
  null body, and a string body — such as an HTML page from a proxy — was read as
  an object.
* Custom axios headers no longer drop authentication. The caller's axios config
  was spread wholesale over the defaults, so supplying any `headers` replaced the
  SDK's own, including `Authorization`.
* Requests now time out. Axios applies no timeout by default and none was set, so
  a hung server blocked forever. Requests now default to 30 seconds, matching the
  PHP and Python SDKs.

### Features

* Every error now carries `statusCode`, `response` and `errors`, along with a
  `codes` getter for branching on SendLayer's numeric error codes. These
  previously existed only on `SendLayerAPIError`.
* Added `SendLayerNotFoundError`, `SendLayerRateLimitError` and
  `SendLayerInternalServerError`.
* `new SendLayer(apiKey, config)` now forwards configuration to the underlying
  client. The constructor accepted only `apiKey`, so `ClientConfig` was defined
  but unreachable — `timeout`, `attachmentURLTimeout` and the `axios` options
  could not be set at all.
* All seven error types are exported from the package root, along with the
  `ClientConfig` and `SendLayerErrorEntry` types. Only `SendLayerError` and
  `SendLayerAPIError` were.

### Documentation

* Documented the error properties, the full list of error types, and the
  `SendLayerAPIError` message prefix. The previous list described
  `SendLayerError` as "validation errors" when it is the base type.
* Added a Configuration section and an explicit HTML-with-plain-text-fallback
  example. The README's parameter example already passed both `html` and `text`,
  which the code was silently dropping.

### Breaking Changes

* `404` now rejects with `SendLayerNotFoundError`, and `429`/`500` with
  `SendLayerRateLimitError`/`SendLayerInternalServerError`, rather than
  `SendLayerAPIError`. Their messages no longer carry the
  `API Error <status>: ` prefix. Code matching on `error.name === 'SendLayerAPIError'`
  or on that prefix for these statuses needs updating.
* Requests now time out after 30 seconds by default. Callers relying on unbounded
  waits will see `SendLayerError` and should set an explicit `timeout`.

## 1.0.3

* Earlier releases; see the commit history.

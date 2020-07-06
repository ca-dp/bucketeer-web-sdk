Bucketeer SDK for Web Client-Side
====

This is Bucketeer Client-Side JavaScript SDK used in web browser

browser support
----

- Chrome (any recent)
- Firefox (any recent)
- Safari (any recent)
- Edge (any recent)
- Internet Explorer (IE11+)

If your project supports IE11, import Promise and Map/Set polyfill separately.

about LocalStorage
----

Save data to LocalStorage.
If user can't save it (Safari's private browsing etc.), user can't do the following.

- Caching feature flags.
- Sending all events.
  - Events are sent at regular intervals, so if unsent events remain, such as when reloading the browser, cache it, but that isn't possible.

But you can do A/B Testing itself.

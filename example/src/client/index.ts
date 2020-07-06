import { Nullable, isNotNull } from 'option-t/lib/Nullable/Nullable';
import { mapOrForNullable } from 'option-t/lib/Nullable/mapOr';
import { tapNullable } from 'option-t/lib/Nullable/tap';

// NOTE: If you want to use SDK published on npm,
// replace the path below with the following.
// '@bucketeer/sdk'
import { Bucketeer, FetchLike, FetchRequestLike, FetchResponseLike } from '../../../lib';

// The user project chooses whether to use fetch or XMLHttpRequest.
// We used XMLHttpRequest here, but you can use simple fetch() as it is.
function fetchLike(url: string, request: FetchRequestLike): Promise<FetchResponseLike> {
  return new Promise((resolve) => {
    const { method, headers, body } = request;
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    for (const key in headers) {
      if (headers.hasOwnProperty(key)) {
        xhr.setRequestHeader(key, headers[key]);
      }
    }
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        // tslint:disable-next-line no-magic-numbers
        if (xhr.status === 200) {
          resolve({
            ok: true,
            json() {
              return Promise.resolve(JSON.parse(xhr.responseText));
            },
          });
        } else {
          resolve({
            ok: false,
            json() {
              return Promise.resolve({});
            },
          });
        }
      }
    };
    xhr.send(body);
  });
}

async function execute() {
  const { initialize } = await import(
    /* webpackChunkName: "bucketeer" */

    // NOTE: If you want to use SDK published on npm,
    // replace the path below with the following.
    // '@bucketeer/sdk'
    '../../../lib'
  );

  /**
   *  Public API
   *  Initialize bucketeer.
   *  Returned instance is the body of the bucketeer.
   *
   *  host:   Api request destination.
   *  token:  Authentication token when requesting.
   *  tag:    Grouping set by bucketeer.
   *  user:   Users using services.
   *          Set user attribute in data.
   *  fetch:  Implement logic close to ES2015's Fetch and specify it.
   *          Of course, it is okay to specify ES2015's Fetch as it is.
   *  pollingIntervalForGetEvaluations:
   *          Interval for getting feature flags in internal API.
   *          Specify in milliseconds.
   *  pollingIntervalForGetEvaluations:
   *          Interval for registering track events in internal API.
   *          Specify in milliseconds.
   */
  const bucketeer = initialize({
    host: 'https://api-uat.bucketeer.jp:443',
    token: '<TOKEN>',
    tag: 'web',
    user: {
      id: 'user',
      data: {
        foo: 'bar',
      },
    },
    fetch: fetchLike,
    // tslint:disable-next-line no-magic-numbers
    pollingIntervalForGetEvaluations: 2 * 60 * 1000,
    // tslint:disable-next-line no-magic-numbers
    pollingIntervalForRegisterEvents: 2 * 60 * 1000,
  });

  /**
   *  Public API
   *  Useful for trouble shooting.
   *  Return GIT_REVISION and BUILD_DATE.
   */
  console.table(bucketeer.getBuildInfo());

  window.addEventListener('beforeunload', () => {
    /**
     *  Public API
     *  Use to destroy bucketeer sdk.
     *  User must call destory() in an arbitrary point (e.g. beforeunload timing).
     */
    bucketeer.destroy();
  });

  /**
   *  Public API
   *  Get feature flag.
   *  Depending on the setting of bucketeer admin console, json and numerical values may be returned as strings.
   *  In that case parse it in the user project and use it.
   *
   *  featureId:    ID for getting feature flag. It is set by bucketeer.
   *  defaultValue: If the bucketeer side is not ready or calls before the bucketeer request,
   *                defaultValue is returned.
   */
  const variation = bucketeer.getStringVariation('featureId', 'defaultValue');

  const buttonElement = document.createElement('button');
  buttonElement.textContent = variation;
  buttonElement.addEventListener('click', () => {
    /**
     *  Public API
     *  Use to tracking events.
     *  By feature flag, when a user executes something, it is sent as a log.
     *
     *  goalId: ID for tracking results.
     *  value:  Set the value if the result requires it.
     */
    bucketeer.track('goalId');
  });
  document.body.appendChild(buttonElement);
}

execute();

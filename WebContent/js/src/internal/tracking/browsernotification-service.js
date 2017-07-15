/**
 * Copyright - A Produle Systems Private Limited. All Rights Reserved.
 *
 * @desc UserComIO browser notification.This function is run once which activates the browser service worker.
 *
 */
 

function browserNotification()
{
	navigator.serviceWorker.register(DEFAULT_CONFIG.serviceWorkerFile)
        .then(function(registration) {

            return registration.pushManager.getSubscription()
                .then(function(subscription) {
                    if (subscription) {
                      return subscription;
                    }
                return registration.pushManager.subscribe({ userVisibleOnly: true });
          });
        })
        .then(function(subscription) {
            fetch(DEFAULT_CONFIG.api_baseurl+'/VisitorTrackingManager/register', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: usercomlib.sessionId,
                    endpoint: subscription.endpoint,
                    p256dh: btoa(String.fromCharCode.apply(null,new Uint8Array(subscription.getKey('p256dh')))),
                    auth: btoa(String.fromCharCode.apply(null,new Uint8Array(subscription.getKey('auth')))),
                }),
            });
        });
	
}

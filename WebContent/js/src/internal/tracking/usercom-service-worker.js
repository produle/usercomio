self.addEventListener('push', function(event) {

    var data = {};
    if (event.data) {
        data = event.data.json();
    }

    var title = data.title || "Usercom";
    var message = data.message || "There is a new message for you";

    self.registration.showNotification(title, {
        body: message,
        icon: data.icon,
        data: {"url": data.url},
    });
});

self.addEventListener('notificationclick', function(event) {
    var data = event.notification.data;

    // Create a promise that triggers a window open
    var promise = new Promise(function(resolve) {
        setTimeout(resolve, 300);
    }).then(function() {
        return clients.openWindow(data.url);
    });

    event.notification.close();

    // Now wait for the promise to keep the permission alive.
    event.waitUntil(promise);
});

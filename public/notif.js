function showNotification(author, message) {
  const notification = new Notification("New message from " + author, {
    body: message,
    icon: "./img/plug.png",
  });

  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  notification.onclick = (e) => {
    window.location.href = `${APP_URL}`;
  };

  // Close notification after x seconds
  setTimeout(function () {
    notification.close();
  }, 8000);
}

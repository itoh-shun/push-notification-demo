self.addEventListener('push', function(event) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: 'vite.svg',  // 任意のアイコンを指定
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
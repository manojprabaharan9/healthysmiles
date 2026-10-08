document.addEventListener('DOMContentLoaded', function () {
  var slides = document.querySelectorAll('.hero-slide');
  var dots = document.querySelectorAll('.hero-dot');
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');

  if (!slides.length || !prev || !next) return;

  var index = 0;
  var timer;

  function show(n) {
    index = (n + slides.length) % slides.length;

    for (var i = 0; i < slides.length; i++) {
      slides[i].classList.toggle('is-active', i === index);
    }

    for (var j = 0; j < dots.length; j++) {
      dots[j].classList.toggle('is-active', j === index);
    }
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  prev.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    show(index - 1);
    restart();
  });

  next.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    show(index + 1);
    restart();
  });

  for (var k = 0; k < dots.length; k++) {
    (function (dotIndex) {
      dots[dotIndex].addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        show(dotIndex);
        restart();
      });
    })(k);
  }

  show(0);
  restart();
});
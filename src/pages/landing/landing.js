/**
 * LANDING.JS - Logic & Interactivity
 * Aplikasi PLH-Intelligence
 * SMART Ekselensia Indonesia
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi Elemen Navigasi Mobile
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    // Toggle Menu Buka/Tutup
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('open');
    });

    // Tutup Menu Otomatis Saat Salah Satu Tautan Diklik
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
        }
      });
    });

    // Tutup Menu Saat Mengklik di Luar Area Navigasi
    document.addEventListener('click', (event) => {
      const isClickInside = navMenu.contains(event.target) || navToggle.contains(event.target);
      if (!isClickInside && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
    });
  }

  // 2. Smooth Scrolling untuk Tautan Internal (#)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      
      if (targetId !== '#') {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const navbarHeight = document.querySelector('.navbar').offsetHeight || 70;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  console.log('PLH-Intelligence Landing Page Loaded - SMART Ekselensia Indonesia');
});
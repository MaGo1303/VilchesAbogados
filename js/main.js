(() => {
  'use strict';

  const API_BASE = 'http://localhost:3001/api';

  // ==============================
  // AUTH HELPERS
  // ==============================

  function getToken() { return localStorage.getItem('token'); }
  function setToken(t) { localStorage.setItem('token', t); }
  function clearToken() { localStorage.removeItem('token'); }
  function getAuthUser() {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  }
  function setAuthUser(u) { localStorage.setItem('authUser', JSON.stringify(u)); }
  function clearAuthUser() { localStorage.removeItem('authUser'); }
  function isLoggedIn() { return !!getToken(); }
  function isAdmin() { const u = getAuthUser(); return u && u.role === 'admin'; }
  window.logout = function() { clearToken(); clearAuthUser(); window.location.href = 'index.html'; };

  function authHeaders() {
    const t = getToken();
    return t ? { 'Authorization': 'Bearer ' + t, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  }

  // ==============================
  // NAVBAR
  // ==============================

  function buildNav() {
    let extraLinks = '';
    if (isLoggedIn()) {
      const user = getAuthUser();
      extraLinks = `
        <li><a href="mis-citas.html">Mis Citas</a></li>
        ${isAdmin() ? '<li><a href="admin.html">Admin</a></li>' : ''}
        <li><span style="color:var(--gold);padding:0.5rem 0.8rem;font-size:0.85rem">${user.nombre}</span></li>
        <li><a href="#" onclick="logout()" style="color:#e74c3c">Salir</a></li>
      `;
    } else {
      extraLinks = `
        <li><a href="login.html" style="font-size:1.2rem;padding:0.5rem 0.6rem" aria-label="Iniciar sesión"><i class="fas fa-user-circle"></i></a></li>
      `;
    }

    return `
  <nav class="navbar" id="navbar">
    <div class="container">
      <a href="index.html" class="logo">Vilches<span>Abogados</span></a>
      <div class="nav-toggle" id="navToggle">
        <span></span><span></span><span></span>
      </div>
      <ul class="nav-links" id="navLinks">
        <li><a href="index.html">Inicio</a></li>
        <li><a href="index.html#nosotros">Nosotros</a></li>
        <li><a href="index.html#servicios">Servicios</a></li>
        <li><a href="equipo.html">Equipo</a></li>
        <li><a href="index.html#contacto">Contacto</a></li>
        <li><a href="agendar.html" class="nav-cta">Agendar Cita</a></li>
        ${extraLinks}
      </ul>
    </div>
  </nav>`;
  }

  const footerHTML = `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="logo">Vilches<span>Abogados</span></a>
          <p>Más de 25 años defendiendo a personas en Madrid. Cercanía, experiencia y resultados.</p>
          <div class="footer-social">
            <a href="https://www.facebook.com/abogadoshernandezvilches" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <h4>Servicios</h4>
          <ul>
            <li><a href="index.html#servicios">Derecho de Familia</a></li>
            <li><a href="index.html#servicios">Herencias</a></li>
            <li><a href="index.html#servicios">Derecho Civil</a></li>
            <li><a href="index.html#servicios">Derecho Penal</a></li>
            <li><a href="index.html#servicios">Derecho Bancario</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="equipo.html">Nuestro Equipo</a></li>
            <li><a href="index.html#metodo">El Método Vilches</a></li>
            <li><a href="agendar.html">Agendar Cita</a></li>
            <li><a href="index.html#contacto">Contacto</a></li>
          </ul>
        </div>
        <div class="footer-newsletter">
          <h4>Contacto</h4>
          <p>Calle Jorge Juan 78, 5º B - 28009 Madrid</p>
          <p style="margin-top:8px"><a href="tel:+34910917965" style="color:var(--accent);font-weight:600">91 091 79 65</a></p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 Vilches Abogados Madrid. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>`;

  function loadComponent(id, html) {
    const el = document.getElementById(id);
    if (el) {
      el.outerHTML = html;
      return true;
    }
    return false;
  }

  loadComponent('nav-placeholder', buildNav());
  loadComponent('footer-placeholder', footerHTML);

  // Defer navbar + mobile toggle init until components are in DOM
  setTimeout(() => {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // Scroll effect
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
      });
      if (window.scrollY > 60) navbar.classList.add('scrolled');
    }

    // Mobile toggle
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
      });
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navToggle.classList.remove('active');
          navLinks.classList.remove('active');
        });
      });
    }
  }, 50);

  // ==============================
  // STATS COUNTER
  // ==============================
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated || !statNumbers.length) return;
    const trigger = document.querySelector('.stats');
    if (!trigger) return;
    if (trigger.getBoundingClientRect().top < window.innerHeight - 80) {
      statsAnimated = true;
      statNumbers.forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 2000;
        const start = performance.now();
        function update(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = target >= 1000 ? Math.floor(eased * target).toLocaleString() : Math.floor(eased * target);
          if (t < 1) requestAnimationFrame(update);
          else el.textContent = target >= 1000 ? target.toLocaleString() : target;
        }
        requestAnimationFrame(update);
      });
    }
  }
  window.addEventListener('scroll', animateStats);
  animateStats();

  // ==============================
  // TESTIMONIALS (index.html)
  // ==============================
  const testimonials = [
    { text: 'Despacho cercano y profesionalidad, se han implicado y empatizado totalmente con mi situación.', name: 'Raúl Picazo', role: 'Cliente', initials: 'RP' },
    { text: 'Pusimos en manos legales la herencia de mis padres con ellos. Marta nos ha explicado todo perfectamente y hemos podido gestionar la herencia todos de acuerdo.', name: 'Alba Candil', role: 'Cliente', initials: 'AC' },
    { text: 'Tuve una primera consulta con Blanca y fue muy resolutiva. Dada la profesionalidad y cercanía contratamos sus servicios para la compraventa de una casa.', name: 'Sonia Velasco', role: 'Cliente', initials: 'SV' },
    { text: 'Blanca me ha ayudado desde el minuto uno para poder crear mi empresa con todo legal y sin tener futuros problemas, ha sido un gran apoyo.', name: 'Yasmina Cruz', role: 'Cliente', initials: 'YC' },
    { text: 'Quería dar las gracias a mi abogada Nuria Domínguez porque ha resultado ser una gran letrada penalista, muchas gracias por todo!', name: 'Valentina Amaya', role: 'Cliente', initials: 'VA' },
    { text: 'Nuestro caso (compra-venta de inmueble) lo han llevado Blanca y Marina y solo decir que totalmente recomendables.', name: 'Miguel Ángel', role: 'Cliente', initials: 'MA' },
  ];

  const testimonialsGrid = document.getElementById('testimonialsGrid');
  if (testimonialsGrid) {
    testimonials.forEach(t => {
      const card = document.createElement('div');
      card.className = 'testimonial-card';
      card.innerHTML = `
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"${t.text}"</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${t.initials}</div>
          <div>
            <div class="testimonial-name">${t.name}</div>
            <div class="testimonial-role">${t.role}</div>
          </div>
        </div>`;
      testimonialsGrid.appendChild(card);
    });
  }

  // ==============================
  // CONTACT FORM (index.html)
  // ==============================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      showToast('Mensaje enviado con éxito. Le responderemos a la brevedad.');
      contactForm.reset();
    });
  }

  // ==============================
  // TYPING EFFECT (hero)
  // ==============================
  const typingEl = document.getElementById('typing-text');
  const typingAccent = document.getElementById('typing-accent');
  if (typingEl && typingAccent) {
    const phrases = ['25 años defendiendo ', 'Cercanía y experiencia ', 'Su caso en buenas manos '];
    const suffix = 'a personas como usted';
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function typeLoop() {
      const current = phrases[phraseIdx];
      if (!isDeleting) {
        typingEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) {
          typingAccent.textContent = suffix;
          setTimeout(() => { isDeleting = true; }, 2000);
          setTimeout(typeLoop, 2200);
          return;
        }
        setTimeout(typeLoop, 60);
      } else {
        typingAccent.textContent = '';
        typingEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(typeLoop, 400);
          return;
        }
        setTimeout(typeLoop, 30);
      }
    }
    setTimeout(typeLoop, 500);
  } else {
    const h1 = document.querySelector('.hero h1');
    if (h1) h1.innerHTML = '25 años defendiendo <span class="text-accent">a personas como usted</span>';
  }

  // ==============================
  // SCROLL REVEAL ANIMATIONS
  // ==============================
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    if (!reveals.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  }
  initScrollReveal();

  // ==============================
  // LIVE STATS FROM API
  // ==============================
  function loadLiveStats() {
    fetch(`${API_BASE}/stats`)
      .then(r => r.json())
      .then(data => {
        const casosEl = document.getElementById('statCasos');
        const abogEl = document.getElementById('statAbogados');
        const liveAbogEl = document.getElementById('liveAbogados');
        if (casosEl) casosEl.textContent = data.totalCitas > 0 ? data.totalCitas : '—';
        if (abogEl) abogEl.textContent = data.totalAbogados || '—';
        if (liveAbogEl) liveAbogEl.setAttribute('data-target', data.totalAbogados || liveAbogEl.getAttribute('data-target'));
      })
      .catch(() => {});
  }
  loadLiveStats();

  // ==============================
  // NEWSLETTER FORMS
  // ==============================
  document.addEventListener('submit', e => {
    if (e.target.classList.contains('newsletter-form')) {
      e.preventDefault();
      showToast('Gracias por suscribirse. Recibirá nuestras novedades.');
      e.target.reset();
    }
  });

  // ==============================
  // TOAST
  // ==============================
  function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // ==============================
  // LOGIN (login.html)
  // ==============================
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const btn = loginForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Ingresando...';
      fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            setToken(res.token);
            setAuthUser(res.user);
            showToast('Sesión iniciada correctamente');
            setTimeout(() => { window.location.href = res.user.role === 'admin' ? 'admin.html' : 'mis-citas.html'; }, 500);
          } else {
            showToast(res.error || 'Error al iniciar sesión');
          }
        })
        .catch(() => showToast('Error de conexión'))
        .finally(() => { btn.disabled = false; btn.textContent = 'Ingresar'; });
    });
  }

  // ==============================
  // REGISTER (register.html)
  // ==============================
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const nombre = document.getElementById('regNombre').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const btn = registerForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Registrando...';
      fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      })
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            setToken(res.token);
            setAuthUser(res.user);
            showToast('Cuenta creada correctamente');
            setTimeout(() => { window.location.href = 'mis-citas.html'; }, 500);
          } else {
            showToast(res.error || 'Error al registrarse');
          }
        })
        .catch(() => showToast('Error de conexión'))
        .finally(() => { btn.disabled = false; btn.textContent = 'Crear Cuenta'; });
    });
  }

  // ==============================
  // APPOINTMENT BOOKING (agendar.html)
  // ==============================

  const abogadoSelect = document.getElementById('abogadoSelect');
  const fechaInput = document.getElementById('fechaInput');
  const horarioSelect = document.getElementById('horarioSelect');
  const bookingForm = document.getElementById('bookingForm');
  let abogados = [];

  if (abogadoSelect) {
    // Fetch lawyers from API
    fetch(`${API_BASE}/abogados`)
      .then(r => r.json())
      .then(data => {
        abogados = data.abogados || [];
        abogados.forEach(a => {
          const opt = document.createElement('option');
          opt.value = a.id;
          opt.textContent = `${a.nombre} — ${a.especialidad}`;
          abogadoSelect.appendChild(opt);
        });
      })
      .catch(() => {
        showToast('Error al cargar abogados');
      });

    // Set min date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    fechaInput.min = `${yyyy}-${mm}-${dd}`;

    // Fetch slots when abogado + fecha selected
    function fetchSlots() {
      const abogadoId = abogadoSelect.value;
      const fecha = fechaInput.value;
      horarioSelect.innerHTML = '<option value="">Cargando horarios...</option>';
      horarioSelect.disabled = true;

      if (!abogadoId || !fecha) {
        horarioSelect.innerHTML = '<option value="">Seleccione un abogado y fecha</option>';
        return;
      }

      fetch(`${API_BASE}/horarios/${abogadoId}/${fecha}`)
        .then(r => r.json())
        .then(data => {
          horarioSelect.innerHTML = '';
          if (data.slots && data.slots.length > 0) {
            const headerOpt = document.createElement('option');
            headerOpt.value = '';
            headerOpt.textContent = 'Seleccione un horario';
            horarioSelect.appendChild(headerOpt);
            data.slots.forEach(slot => {
              const opt = document.createElement('option');
              opt.value = slot;
              opt.textContent = slot;
              horarioSelect.appendChild(opt);
            });
            horarioSelect.disabled = false;
          } else {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = data.message || 'No hay horarios disponibles para esta fecha';
            horarioSelect.appendChild(opt);
            horarioSelect.disabled = true;
          }
        })
        .catch(() => {
          horarioSelect.innerHTML = '<option value="">Error al cargar horarios</option>';
          horarioSelect.disabled = true;
        });
    }

    abogadoSelect.addEventListener('change', fetchSlots);
    fechaInput.addEventListener('change', fetchSlots);

    // Submit booking
    bookingForm.addEventListener('submit', e => {
      e.preventDefault();

      const data = {
        abogadoId: parseInt(abogadoSelect.value),
        fecha: fechaInput.value,
        horario: horarioSelect.value,
        nombre: document.getElementById('nombreInput').value.trim(),
        email: document.getElementById('emailInput').value.trim(),
        telefono: document.getElementById('telInput').value.trim(),
        area: document.getElementById('areaSelect').value,
        descripcion: document.getElementById('descripcionInput').value.trim(),
      };

      if (!data.abogadoId || !data.fecha || !data.horario || !data.nombre || !data.email || !data.area) {
        showToast('Complete todos los campos obligatorios.');
        return;
      }

      const btn = bookingForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Reservando...';

      fetch(`${API_BASE}/citas`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            showModal(data);
            bookingForm.reset();
            horarioSelect.innerHTML = '<option value="">Seleccione un abogado y fecha</option>';
            horarioSelect.disabled = true;
          } else {
            showToast(res.error || 'Error al agendar la cita.');
          }
        })
        .catch(() => showToast('Error de conexión con el servidor.'))
        .finally(() => {
          btn.disabled = false;
          btn.textContent = 'Confirmar Reserva';
        });
    });
  }

  // ==============================
  // CONFIRMATION MODAL
  // ==============================
  function showModal(data) {
    const overlay = document.getElementById('confirmModal');
    const details = document.getElementById('modalDetails');
    if (!overlay || !details) return;
    const abog = abogados.find(a => a.id === data.abogadoId);
    details.innerHTML = `
      <strong>Abogado:</strong> ${abog ? abog.nombre : '—'}<br>
      <strong>Fecha:</strong> ${new Date(data.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
      <strong>Horario:</strong> ${data.horario}<br>
      <strong>Nombre:</strong> ${data.nombre}<br>
      <strong>Email:</strong> ${data.email}<br>
      <strong>Área:</strong> ${data.area}
    `;
    overlay.classList.add('active');
  }

  document.addEventListener('click', e => {
    if (e.target.id === 'modalCloseBtn' || e.target.classList.contains('modal-overlay')) {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }
  });

  // ==============================
  // MIS CITAS (mis-citas.html)
  // ==============================
  const citasContainer = document.getElementById('citasContainer');
  if (citasContainer) {
    if (!isLoggedIn()) {
      citasContainer.innerHTML = '<p style="text-align:center;padding:2rem"><a href="login.html">Inicie sesión</a> para ver sus citas.</p>';
    } else {
      fetch(`${API_BASE}/mis-citas`, { headers: { 'Authorization': 'Bearer ' + getToken() } })
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
          if (!data.citas || data.citas.length === 0) {
            citasContainer.innerHTML = '<p style="text-align:center;padding:2rem">No tiene citas agendadas. <a href="agendar.html">Agende una aquí</a>.</p>';
            return;
          }
          let html = '<div class="citas-list">';
          data.citas.forEach(c => {
            html += `
              <div class="booking-card" style="margin-bottom:1rem">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">
                  <div><strong>Abogado:</strong> ${c.abogado}</div>
                  <div><strong>Fecha:</strong> ${new Date(c.fecha + 'T12:00:00').toLocaleDateString('es-ES')}</div>
                  <div><strong>Horario:</strong> ${c.horario}</div>
                </div>
                <div style="margin-top:0.5rem;color:var(--text-light)">
                  <span>${c.area}</span>${c.descripcion ? ' &mdash; ' + c.descripcion : ''}
                </div>
                <div style="margin-top:0.3rem;font-size:0.8rem;color:var(--text-light)">Agendada el ${new Date(c.creada_en + 'Z').toLocaleString('es-ES')}</div>
              </div>`;
          });
          html += '</div>';
          citasContainer.innerHTML = html;
        })
        .catch(() => {
          citasContainer.innerHTML = '<p style="text-align:center;padding:2rem;color:#e74c3c">Error al cargar sus citas.</p>';
        });
    }
  }

  // ==============================
  // ADMIN (admin.html)
  // ==============================
  const adminContainer = document.getElementById('adminCitasContainer');
  if (adminContainer) {
    if (!isLoggedIn() || !isAdmin()) {
      adminContainer.innerHTML = '<p style="text-align:center;padding:2rem;color:#e74c3c">Acceso denegado. <a href="login.html">Inicie sesión como administrador</a>.</p>';
    } else {
      fetch(`${API_BASE}/admin/citas`, { headers: { 'Authorization': 'Bearer ' + getToken() } })
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
          if (!data.citas || data.citas.length === 0) {
            adminContainer.innerHTML = '<p style="text-align:center;padding:2rem">No hay citas registradas.</p>';
            return;
          }
          let html = '<div style="overflow-x:auto"><table class="admin-table"><thead><tr>' +
            '<th>ID</th><th>Cliente</th><th>Email</th><th>Usuario</th><th>Abogado</th><th>Área</th><th>Fecha</th><th>Horario</th><th>Teléfono</th><th>Descripción</th><th>Agendada</th>' +
            '</tr></thead><tbody>';
          data.citas.forEach(c => {
            html += `<tr>
              <td>${c.id}</td>
              <td>${c.cliente}</td>
              <td>${c.email}</td>
              <td>${c.usuario || '—'}</td>
              <td>${c.abogado}</td>
              <td>${c.area}</td>
              <td>${c.fecha}</td>
              <td>${c.horario}</td>
              <td>${c.telefono || '—'}</td>
              <td>${c.descripcion || '—'}</td>
              <td>${new Date(c.creada_en + 'Z').toLocaleString('es-ES')}</td>
            </tr>`;
          });
          html += '</tbody></table></div>';
          adminContainer.innerHTML = html;
        })
        .catch(() => {
          adminContainer.innerHTML = '<p style="text-align:center;padding:2rem;color:#e74c3c">Error al cargar las citas.</p>';
        });
    }
  }
})();
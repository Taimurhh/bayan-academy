// Bayan Academy website: mobile menu, footer year, and the enrolment form.
(function () {
  document.documentElement.classList.remove('no-js');

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Fees in PKR for Pakistan and USD everywhere else, guessed from the time zone. Visitors can switch.
  var PRICES = {
    PKR: { standard: 'PKR 9,500', term: 'PKR 25,500', termWas: 'PKR 28,500', mSingle: 'PKR 28,000', mPack: 'PKR 100,000', aiMonthly: 'PKR 10,000', aiTerm: 'PKR 27,000', aiTermWas: 'PKR 30,000' },
    USD: { standard: 'USD 45', term: 'USD 120', termWas: 'USD 135', mSingle: 'USD 100', mPack: 'USD 360', aiMonthly: 'USD 45', aiTerm: 'USD 120', aiTermWas: 'USD 135' }
  };
  function guessCurrency() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (tz === 'Asia/Karachi' || tz === '') return 'PKR';
    return 'USD';
  }
  function showCurrency(code) {
    document.querySelectorAll('[data-price]').forEach(function (el) {
      var v = PRICES[code] && PRICES[code][el.getAttribute('data-price')];
      if (v) el.textContent = v;
    });
    document.querySelectorAll('[data-currency]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-currency') === code));
    });
  }
  if (document.querySelector('[data-price]')) {
    showCurrency(guessCurrency());
    document.querySelectorAll('[data-currency]').forEach(function (b) {
      b.addEventListener('click', function () { showCurrency(b.getAttribute('data-currency')); });
    });
  }

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  // Enrolment form
  var form = document.getElementById('enrol-form');
  if (!form) return;

  // Replace with the academy's WhatsApp number, digits only, country code first.
  var WHATSAPP = '923000000000';

  // Tracks and levels per programme. Keep in step with the programme pages.
  // Only Academics asks for a level; for the other programmes we place the student from age and grade.
  var LEVELS = {
    'Bayan Academics': ['Matric', 'FSc', 'O Level', 'A Level']
  };
  var KEYS = { ai: 'Bayan AI', code: 'Bayan Code', stem: 'Bayan STEM', academics: 'Bayan Academics', speak: 'Bayan Speak', mentorship: 'Bayan Mentorship' };

  var programmeInputs = form.querySelectorAll('input[name="programme"]');
  var mentorshipOnly = form.querySelector('[data-for="mentorship"]');
  var levelField = form.querySelector('[data-for="level"]');
  var levelSelect = document.getElementById('level');

  function showProgrammeFields() {
    var chosen = form.querySelector('input[name="programme"]:checked');
    var value = chosen ? chosen.value : '';
    mentorshipOnly.hidden = value !== 'Bayan Mentorship';
    levelField.hidden = !LEVELS[value];
    if (LEVELS[value] && levelSelect.dataset.for !== value) {
      levelSelect.dataset.for = value;
      levelSelect.innerHTML = '<option value="">Choose one</option>' +
        LEVELS[value].map(function (l) { return '<option>' + l + '</option>'; }).join('');
    }
  }
  programmeInputs.forEach(function (input) { input.addEventListener('change', showProgrammeFields); });

  var wanted = KEYS[new URLSearchParams(location.search).get('programme')];
  var wantedInput = wanted && form.querySelector('input[value="' + wanted + '"]');
  if (wantedInput) wantedInput.checked = true;
  showProgrammeFields();

  function setError(name, message) {
    var box = form.querySelector('[data-error="' + name + '"]');
    var fields = form.querySelectorAll('[name="' + name + '"]');
    if (box) box.textContent = message || '';
    fields.forEach(function (f) {
      if (message) f.setAttribute('aria-invalid', 'true');
      else f.removeAttribute('aria-invalid');
    });
    return !message;
  }

  form.addEventListener('input', function (e) { if (e.target.name) setError(e.target.name, ''); });
  form.addEventListener('change', function (e) { if (e.target.name) setError(e.target.name, ''); });

  function value(name) {
    var el = form.querySelector('[name="' + name + '"]:checked') || form.querySelector('[name="' + name + '"]:not([type="radio"])');
    return el ? el.value.trim() : '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var programme = value('programme');
    var phone = value('phone').replace(/[\s-]/g, '');
    var ok = true;
    ok = setError('programme', programme ? '' : 'Choose a programme.') && ok;
    if (programme === 'Bayan Mentorship') ok = setError('batch', value('batch') ? '' : 'Choose one session or four.') && ok;
    if (LEVELS[programme]) ok = setError('level', value('level') ? '' : 'Choose a track or level.') && ok;
    ok = setError('student', value('student') ? '' : "Enter the student's name.") && ok;
    ok = setError('age', /^\d{1,2}$/.test(value('age')) ? '' : "Enter the student's age in years, for example 14.") && ok;
    ok = setError('grade', value('grade') ? '' : "Choose the student's grade or class.") && ok;
    ok = setError('parent', value('parent') ? '' : "Enter the parent's or guardian's name.") && ok;
    ok = setError('phone', /^(\+?92|0)3\d{9}$/.test(phone) ? '' : 'Enter a Pakistani mobile number, for example 0300 1234567.') && ok;
    ok = setError('city', value('city') ? '' : 'Enter your city.') && ok;
    ok = setError('guardian', form.querySelector('[name="guardian"]').checked ? '' : 'Tick this box to confirm you are the parent or guardian.') && ok;
    if (!ok) {
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }

    var detail = programme === 'Bayan Mentorship' ? value('batch') : value('level');
    var lines = [
      programme === 'Bayan Mentorship' ? 'Assalamu alaikum. I would like to book a Bayan Mentorship session.' : 'Assalamu alaikum. I would like to enrol in ' + programme + '.'
    ];
    if (detail) lines.push((programme === 'Bayan Mentorship' ? 'Sessions: ' : 'Level: ') + detail);
    lines.push(
      'Student: ' + value('student') + ', age ' + value('age') + ', ' + value('grade'),
      'Parent or guardian: ' + value('parent'),
      'WhatsApp: ' + phone,
      'City: ' + value('city')
    );
    if (value('notes')) lines.push('Notes: ' + value('notes'));
    var message = lines.join('\n');

    var confirm = document.getElementById('enrol-confirm');
    document.getElementById('confirm-summary').textContent = message;
    document.getElementById('confirm-whatsapp').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(message);
    form.hidden = true;
    confirm.hidden = false;
    confirm.focus();
  });

  document.getElementById('confirm-edit').addEventListener('click', function () {
    document.getElementById('enrol-confirm').hidden = true;
    form.hidden = false;
    form.querySelector('input, select, textarea').focus();
  });
})();

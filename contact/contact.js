/* Led by Light contact form — submit to FormSubmit without leaving the page.
   The endpoint comes from the form's action attribute in /contact/index.html.
   This also supports FormSubmit's opaque endpoint token instead of an email. */
(() => {
  const form = document.querySelector('#inquiry');
  const status = document.querySelector('#form-status');
  if (!form || !status) return;

  const button = form.querySelector('button[type="submit"]');
  const originalButtonHTML = button ? button.innerHTML : '';
  let submitting = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;

    const rawEndpoint = form.getAttribute('action');
    let endpoint;
    try {
      endpoint = new URL(rawEndpoint, window.location.href);
      if (endpoint.protocol !== 'https:' || endpoint.hostname !== 'formsubmit.co') {
        throw new Error('Invalid form endpoint');
      }
      // FormSubmit's AJAX endpoint returns JSON instead of redirecting.
      if (!endpoint.pathname.startsWith('/ajax/')) {
        endpoint.pathname = '/ajax' + endpoint.pathname;
      }
    } catch {
      status.textContent = 'The contact form is not configured correctly. Please email us directly.';
      return;
    }

    submitting = true;
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending…';
    }
    status.textContent = 'Sending your inquiry…';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const fields = Object.fromEntries(new FormData(form).entries());
      const response = await fetch(endpoint.href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(fields),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Submission request failed');
      const result = await response.json();
      if (result.success !== true && result.success !== 'true') {
        throw new Error(result.message || 'Submission not confirmed');
      }
      status.textContent = "Thanks! Your inquiry has been sent. We'll be in touch soon.";
      form.reset();
    } catch (error) {
      status.textContent = 'We could not confirm that your inquiry was sent. Please try again or email us directly.';
    } finally {
      clearTimeout(timeout);
      submitting = false;
      if (button) {
        button.disabled = false;
        button.innerHTML = originalButtonHTML;
      }
    }
  });
})();

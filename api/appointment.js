const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(body));
}

function clean(value, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function validPhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed.' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 500, { error: 'Appointment service is not configured.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const name = clean(body.name, 100);
  const phone = clean(body.phone, 30);
  const branch = clean(body.branch, 100);
  const preferredDate = clean(body.preferredDate, 10);
  const website = clean(body.website, 100);

  if (website) {
    return json(res, 400, { error: 'Unable to submit this request.' });
  }

  const errors = {};
  if (name.length < 2) errors.name = 'Please enter your full name.';
  if (!validPhone(phone)) errors.phone = 'Please enter a valid phone number.';
  if (!branch) errors.branch = 'Please select a branch.';
  if (!validDate(preferredDate)) errors.preferredDate = 'Please choose today or a future date.';

  if (Object.keys(errors).length) {
    return json(res, 422, { error: 'Please correct the highlighted fields.', fields: errors });
  }

  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: 'Bearer ' + SUPABASE_SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  let saved;
  try {
    const insert = await fetch(SUPABASE_URL + '/rest/v1/appointment_requests', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name,
        phone,
        branch,
        preferred_date: preferredDate,
        status: 'new',
        notification_status: 'not_required'
      })
    });

    if (!insert.ok) {
      throw new Error('Database insert failed: ' + insert.status);
    }

    const rows = await insert.json();
    saved = rows[0];
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'We could not save your request. Please try again.' });
  }

  return json(res, 201, {
    ok: true,
    requestId: saved.id,
    message: 'Your appointment request has been received. Our front desk will contact you to confirm the time.'
  });
};

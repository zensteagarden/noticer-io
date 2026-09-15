'use strict';

const STORE_KEY = 'noticer-beta-v3';
const LIVE_PROOF = {
  id: 'live-stripe-access-2026-09-15',
  account: 'Stripe → Access',
  title: 'Paid access became active',
  status: 'SAVED PROOF',
  statusClass: 'saved',
  completedAt: '2026-09-15T12:47:26.449Z',
  payment: 'pi_3UFv…KUon',
  stripeEvent: 'evt_3UFv…FkGh',
  verification1: 'ver_7c48…99fc',
  verification2: 'ver_ecdf…2398',
  protectedWrites: 1,
  matrix: '9 / 9 PASS',
  sourceMutationProbe: '404 / source_mutation_rejected',
  signerInRelyingParty: false,
  mutationAuthorityInRelyingParty: false
};

const DEFAULT_STATE = { ideas: [], feedback: {}, lastInput: '', ledgerView: 'important' };

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    return { ...DEFAULT_STATE, ...(raw || {}), ideas: Array.isArray(raw?.ideas) ? raw.ideas : [] };
  } catch (_) { return { ...DEFAULT_STATE }; }
}
function saveState(state) { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function announce(message) {
  const node = document.getElementById('announcer');
  node.textContent = '';
  window.setTimeout(() => node.textContent = message, 20);
}
function toast(message) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 2800);
}
function route() { return location.hash.replace(/^#/, '') || '/'; }
function go(path) { location.hash = '#' + path; }
function setCurrentNav(path) {
  document.querySelectorAll('.nav a').forEach(a => {
    const selected = path.startsWith(a.dataset.route || '__never__');
    if (selected) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}
function formatDate(iso) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(iso));
}
function slug() { return 'idea-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }

function discover(text) {
  const q = text.toLowerCase();
  const items = [];
  const add = (title, why, claim, observation, control, systems) => items.push({ title, why, claim, observation, control, systems });

  if (/(pay|paid|payment|customer|access|subscription|checkout|stripe)/.test(q)) {
    add('Paid customers actually receive access', 'Payment success is only the claim. The useful state is the customer being able to use what they bought.', 'Payment system reports success', 'Read the customer entitlement or access state independently', 'Read a nearby known-good access path', ['Payment', 'Access system']);
    add('Refunded customers no longer retain paid access', 'A refund and an entitlement change can silently drift apart.', 'Refund workflow reports completion', 'Read the refunded customer’s entitlement state', 'Read an unaffected healthy entitlement', ['Payment', 'Access system']);
    add('The protected next step happens only once', 'Retries and duplicate events should not create duplicate consequences.', 'Workflow asks to continue', 'Observe the consequence record', 'Verify the gate and replay path are healthy', ['Workflow', 'Gate']);
  } else if (/(claim|payer|insurance|authorization|billing|health|caregiver|visit|medicaid|medicare)/.test(q)) {
    add('Submitted claims reach the required downstream state', 'A submission confirmation is not the same thing as payer or clearinghouse acceptance.', 'Billing system says the claim was submitted', 'Read the identified claim in the downstream destination', 'Read a nearby known-good claim through the same path', ['Billing', 'Clearinghouse / payer']);
    add('Required authorization is present before the business relies on it', 'Teams can act on an internal status that has not propagated to the place that actually controls the work.', 'Internal workflow says authorization is ready', 'Read the usable authorization state at the authorized destination', 'Read a nearby healthy authorization through the same observer', ['Operations', 'Authorization source']);
    add('Money posted where finance expects it', 'A payment event and the accounting state it should create are different propositions.', 'Payment source reports success', 'Read the corresponding downstream posting', 'Read a nearby healthy posting path', ['Payment', 'Accounting']);
  } else if (/(website|page|publish|published|live|domain|site|button|cta)/.test(q)) {
    add('The production page actually shows the intended release', 'A deploy or publish success does not establish what a user can retrieve from production.', 'Publishing system says release completed', 'Observe the required content or behavior at the production URL', 'Observe a nearby healthy production path', ['Publisher', 'Production website']);
    add('The primary action still completes', 'A page can load while the business-critical action is silently broken.', 'Site is reported healthy', 'Exercise or observe the critical action outcome', 'Exercise a nearby known-good control', ['Website', 'Destination']);
    add('A later change did not quietly undo the required state', 'The useful proposition may need to stay open after the initial release.', 'Required state was previously established', 'Re-observe the changed thing inside a defined window', 'Re-observe the control in the same window', ['Website']);
  } else if (/(form|lead|email|message|submission|contact)/.test(q)) {
    add('The submission actually arrived at its authorized destination', 'A form can say “sent” while the downstream record never arrives.', 'Form reports successful submission', 'Read the correlated record at the destination', 'Read a nearby known-good destination path', ['Form', 'Destination']);
    add('The right event is matched to the right downstream record', 'Ambiguous correlation can create false success.', 'Workflow emits an event identifier', 'Read exactly one matching downstream record', 'Verify the same observer can resolve a known-good identifier', ['Source', 'Destination']);
    add('The handoff stays open until the downstream state exists or proof stops', 'Not-yet-true should not be collapsed into false.', 'Handoff begins', 'Observe until established, contradicted, deadline, or observer failure', 'Keep the observer control healthy during the wait', ['Source', 'Destination']);
  } else if (/(deploy|release|github|build|ci|code|production)/.test(q)) {
    add('Production reflects the approved release', 'A green build or deploy means the machinery ran, not necessarily that production reached the required state.', 'CI/deploy system reports success', 'Read the intended release behavior from production', 'Read a nearby known-good production path', ['CI/CD', 'Production']);
    add('A receipt exists before the consequential follow-on action', 'The next system should not be allowed to proceed on the claimant’s green check alone.', 'Release workflow asks to continue', 'Verify a fresh receipt bound to the release', 'Verify receipt service health independently', ['CI/CD', 'Noticer gate']);
    add('Retries do not duplicate the protected action', 'Healthy automation must survive retries without multiplying consequences.', 'Workflow retries', 'Read the protected consequence record', 'Verify replay protection path is healthy', ['Workflow', 'Gate']);
  } else if (/(payroll|hours|timesheet|wage|employee|staff)/.test(q)) {
    add('Approved hours actually arrive in the payroll destination', 'An export success does not establish the expected employee rows exist downstream.', 'Time system reports export complete', 'Read the correlated payroll records', 'Read a nearby known-good payroll record through the same path', ['Time system', 'Payroll']);
    add('The expected population is complete before payroll relies on it', 'A partially successful batch can look healthy while omitting people.', 'Batch reports success', 'Compare required population against downstream population', 'Verify a known-good batch/control path', ['Source', 'Payroll']);
    add('A correction reaches the downstream record it was meant to change', 'Correction workflows can succeed locally while leaving the destination stale.', 'Correction reports completion', 'Read the corrected destination record', 'Read a nearby unaffected record', ['Source', 'Payroll']);
  } else {
    const sentence = text.trim().replace(/[.?!]+$/, '');
    add(sentence || 'The thing that matters is actually true', 'Noticer would separate the system’s claim from the state you actually depend on.', 'Identify the actor or system making the claim', 'Observe the changed thing independently', 'Observe a nearby healthy path', ['Source', 'Outcome source']);
    add('The claim stays open until evidence resolves it', 'Not-yet-true, contradicted, and unobservable are different states.', 'A consequential claim is made', 'Keep observing within an explicit window', 'Keep the observation path itself under control', ['Source', 'Observer']);
    add('The next consequential action requires a valid receipt', 'A receipt becomes useful when another process actually depends on it.', 'A system asks to proceed', 'Verify the receipt and its binding', 'Verify the receipt-verification path is healthy', ['Workflow', 'Noticer gate']);
  }
  return items.slice(0, 3);
}

function homeView() {
  const state = loadState();
  return `
    <section class="home" aria-labelledby="home-title">
      <div class="black-box">
        <p class="eyebrow">Black Box</p>
        <div class="cube-stage" aria-hidden="true"><div class="cube"></div></div>
        <h1 id="home-title">Tell me something to notice.</h1>
        <p class="subhead">Something you depend on being true. Noticer works out what would need to be observed before you rely on it.</p>
        <form class="notice-form" id="notice-form">
          <label class="sr-only" for="notice-input">Tell Noticer something that matters</label>
          <div class="input-shell">
            <input class="notice-input" id="notice-input" autocomplete="off" maxlength="280" placeholder="Paid customers should actually get access." value="${escapeHtml(state.lastInput)}" />
            <button class="send" type="submit" aria-label="Ask Noticer what could be tracked">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <p class="input-note">Value before permission. No account connection is requested until Noticer can explain why it matters.</p>
        </form>
        <div id="discovery-slot"></div>
        <a class="proof-link" href="#/proof/live">Explore a real Noticer proof <span aria-hidden="true">→</span></a>
      </div>
    </section>`;
}

function discoveryView(text, candidates) {
  return `<section class="discovery" aria-labelledby="discovery-title">
    <div class="discovery-head">
      <p class="mono">Understand → Discover → Qualify</p>
      <h2 id="discovery-title">I found some things worth keeping track of.</h2>
      <p>You said: “${escapeHtml(text)}”</p>
    </div>
    <ul class="candidate-list">
      ${candidates.map((c, i) => `<li class="candidate">
        <div>
          <h3>${escapeHtml(c.title)}</h3>
          <p>${escapeHtml(c.why)}</p>
          <div class="evidence-line" aria-label="Evidence that would be needed">
            <span class="chip">claim</span><span class="chip">questioned observation</span><span class="chip">healthy control</span><span class="chip">receipt</span>
          </div>
        </div>
        <div class="candidate-action">
          <button class="button secondary small" type="button" data-save-candidate="${i}">Keep this</button>
          <span class="mono" style="color:var(--faint)">setup needed</span>
        </div>
      </li>`).join('')}
    </ul>
  </section>`;
}
